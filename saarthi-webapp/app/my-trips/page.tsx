'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Edit } from 'lucide-react';
import { listRides, generateInvoice, cancelRide, updateUserProfile } from '../services/apiService';
import Header from '../components/Header';
import toast from 'react-hot-toast';

// Define Trip interface for type safety
interface Trip {
  _id?: string;
  ride_id?: string;
  user?: string;
  type?: 'hourly' | 'outstation' | 'airport-transfer';
  hours?: number | null;
  pickupLocation?: string;
  dropLocation?: string | null;
  fare?: number;
  totalFare?: number;
  price?: number;
  status?: 'confirmed' | 'completed' | string;
  pickupDatetime?: string;
  airportTerminal?: string;
  airportDirection?: 'to' | 'from';
  createdAt?: string;
  updatedAt?: string;
}

const MyTripsPage = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceLoading, setInvoiceLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [userPhone, setUserPhone] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameUpdateLoading, setNameUpdateLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelRideId, setCancelRideId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reasonInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Fetch trips on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const phone = user.phoneNumber || '';
      const id = user._id || user.id || '';
      const name = user.name || '';
      
      setUserPhone(phone);
      setUserId(id);
      setUserName(name);

      if (phone) {
        setLoading(true);
        listRides(phone)
          .then((data) => {
            if (Array.isArray(data?.rides)) {
              setTrips(data.rides);
            } else {
              setTrips([]);
            }
          })
          .catch(() => {
            toast.error('Failed to load trips.');
            setTrips([]);
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } catch {
      toast.error('Invalid user data.');
      setLoading(false);
    }
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (showCancelDialog && reasonInputRef.current) {
      reasonInputRef.current.focus();
    }
  }, [showCancelDialog]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  const isPickupWithin3Hours = (pickupDatetime?: string) => {
    if (!pickupDatetime) return false;
    const pickupTime = new Date(pickupDatetime).getTime();
    const now = Date.now();
    const cancelHours = parseInt(process.env.NEXT_PUBLIC_PICKUP_CANCEL_HOURS || '3', 10);
    const cancelWindowMs = cancelHours * 60 * 60 * 1000;
    return pickupTime - now <= cancelWindowMs;
  };

  const handleCancelClick = (rideId: string) => {
    setCancelRideId(rideId);
    setCancelReason('');
    setShowCancelDialog(true);
  };

  const handleCancelSubmit = async () => {
    if (!cancelRideId || !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason.');
      return;
    }

    setCancelLoading(true);
    try {
      await cancelRide(cancelRideId, cancelReason.trim());
      toast.success('Booking cancelled successfully.');
      if (userPhone) {
        setLoading(true);
        listRides(userPhone)
          .then((data) => {
            if (Array.isArray(data?.rides)) {
              setTrips(data.rides);
            } else {
              setTrips([]);
            }
          })
          .catch(() => {
            toast.error('Failed to reload trips.');
            setTrips([]);
          })
          .finally(() => setLoading(false));
      }
      setShowCancelDialog(false);
    } catch (error: any) {
      toast.error(`Failed to cancel booking: ${error.message || 'Unknown error'}`);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleInvoice = async (rideId: string) => {
    setInvoiceLoading(rideId);
    try {
      const invoicedetail = await generateInvoice(rideId);
      const { invoice } = invoicedetail?.invoice_details;

      if (invoice?.ride && invoice?.amount) {
        const content = `INVOICE

Ride ID: ${invoice.ride}
${rideId}
Amount: ₹${invoice.amount}
${invoice._id}
CreatedAt: ${new Date(invoice.createdAt).toLocaleString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })}

Thank you for riding with us!
`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${invoice.ride}.txt`;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 2000);
      } else if (invoice?.url) {
        window.open(invoice.url, '_blank');
      } else {
        throw new Error('Invalid invoice data');
      }
    } catch (error: any) {
      toast.error(`Failed to generate invoice: ${error.message || 'Unknown error'}`);
    } finally {
      setInvoiceLoading(null);
    }
  };

  const handleNameSave = async () => {
    const trimmedName = userName.trim();
    if (trimmedName.length > 30) {
      toast.error('Name cannot exceed 30 characters.');
      return;
    }

    if (!userId) {
      toast.error('User ID not found.');
      return;
    }

    setNameUpdateLoading(true);
    try {
      await updateUserProfile(userId, trimmedName);
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.name = trimmedName;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      setUserName(trimmedName);
      setIsEditingName(false);
      toast.success('Name updated successfully!');
      setTimeout(()=>{
        window.location.reload()
      },2000)
    } catch (error: any) {
      toast.error(`Failed to update name: ${error.message || 'Please try again.'}`);
    } finally {
      setNameUpdateLoading(false);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !nameUpdateLoading) {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserName(user.name || '');
        } catch {
          setUserName('');
        }
      }
    }
  };

  // Pagination
  const tripsPerPage = 4;
  const pagedTrips = trips.slice((page - 1) * tripsPerPage, page * tripsPerPage);
  const totalPages = Math.ceil(trips.length / tripsPerPage);

  // Format date with ordinal suffix
  const formatDateWithOrdinal = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const time = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    const getOrdinalSuffix = (n: number) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}, ${time}`;
  };

  return (
    <>
      {loading ? (
        <div className="h-screen bg-white">
          <Header/>
          <div className="text-center py-12 text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="min-h-screen bg-white">
          <Header />
          <div className="max-w-4xl mx-auto px-4 py-8">
        {/* User Name Section */}
        <h1 className="text-2xl font-semibold mb-6">My Trips</h1>
        
        {pagedTrips.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No trips found.</div>
        ) : (
          <div className="space-y-4">
            {pagedTrips.map((trip) => (
              <div
                key={trip._id}
                className="bg-[#F2F7F5] rounded-xl p-6 flex flex-col md:flex-row md:items-start md:justify-between"
              >
                <div>
                   <div className="font-medium text-lg mb-1">
                    {trip.type === 'hourly'
                      ? `City Rental for ${trip.hours || 1} hour${trip.hours && trip.hours > 1 ? 's' : ''}`
                      : trip.type === 'outstation'
                      ? 'Outstation Trip'
                      : trip.type === 'airport-transfer'
                      ? `Airport Transfer (${trip.airportDirection === 'to' ? 'To' : 'From'} ${trip.airportTerminal})`
                      : 'Trip'}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    Trip ID: xxx{trip._id?.slice(-4)}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    {trip.pickupDatetime
                      ? formatDateWithOrdinal(new Date(trip.pickupDatetime))
                      : 'N/A'}
                  </div>
                 
                  <div className="text-xs text-gray-500 mb-1">
                    Pickup: {trip.pickupLocation || 'N/A'}
                    {trip.dropLocation && ` → Drop: ${trip.dropLocation}`}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    Total Fare: ₹{trip.fare || trip.totalFare || trip.price || 0}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Booked: {trip.createdAt ? formatDateWithOrdinal(new Date(trip.createdAt)) : 'N/A'}
                  </div>
                  <div style={{width:"fit-content"}}
                        className={`text-xs font-medium mt-1  px-3 py-1 rounded-full ${
                          trip.status === 'confirmed'
                            ? 'bg-green-400 text-white'
                            : trip.status === 'completed'
                            ? 'bg-blue-400 text-white'
                            : trip.status === 'cancelled'
                            ? 'bg-red-400 text-white'
                            : 'bg-gray-400 text-white'
                        }`}
                      >
                         {trip.status || 'N/A'}
                      </div>
                </div>
                <div className="flex items-start space-x-2 mt-4 md:mt-0 md:ml-6">
                 
                  {trip.status === 'confirmed' && !isPickupWithin3Hours(trip.pickupDatetime) && (
                    <button
                      onClick={() => handleCancelClick(trip._id || '')}
                      className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors font-medium text-sm"
                    >
                      Cancel
                    </button>
                  )}
                  {trip.status === 'completed' && (
                    <button
                      onClick={() => handleInvoice(trip._id || '')}
                      className="flex items-center bg-[#016B5D] text-white px-6 py-2 rounded-full hover:bg-teal-700 transition-colors font-medium text-sm"
                      disabled={invoiceLoading === (trip._id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {invoiceLoading === (trip._id) ? 'Loading...' : 'Invoice'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              disabled={page === 1}
            >
              ←
            </button>
            <span className="px-4 py-2 border rounded">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              disabled={page === totalPages}
            >
              →
            </button>
          </div>
        )}

        {/* Cancel Reason Dialog - Centered Overlay */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-auto">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Cancel Booking</h2>
              <p className="text-gray-600 mb-4">Please provide a reason for cancelling this booking:</p>
              <input
                ref={reasonInputRef}
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#016B5D] mb-4"
                disabled={cancelLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !cancelLoading) {
                    handleCancelSubmit();
                  }
                }}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowCancelDialog(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors font-medium text-sm disabled:opacity-50"
                  disabled={cancelLoading}
                >
                  Close
                </button>
                <button
                  onClick={handleCancelSubmit}
                  className="px-4 py-2 bg-[#016B5D] text-white rounded-full hover:bg-teal-700 transition-colors font-medium text-sm disabled:opacity-50"
                  disabled={cancelLoading}
                >
                  {cancelLoading ? 'Cancelling...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
      )}
    </>
  );
};

export default MyTripsPage;