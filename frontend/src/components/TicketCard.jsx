import React, { useRef } from 'react';
import { Download, Printer, Film, MapPin, Calendar, Clock, QrCode, XCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TicketCard = ({ booking, onCancelBooking, showActions = true }) => {
  const ticketRef = useRef(null);

  if (!booking) return null;

  const {
    bookingReference,
    movieId,
    theatreId,
    screenId,
    showId,
    seats = [],
    totalAmount,
    bookingStatus,
    qrCode,
    canCancel,
    createdAt,
  } = booking;

  const movie = movieId || {};
  const theatre = theatreId || {};
  const screen = screenId || {};
  const show = showId || {};

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;
    try {
      const element = ticketRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#090a0f',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);
      pdf.save(`SmartCine-Ticket-${bookingReference}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Could not download PDF. Please try standard print option.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isCancelled = bookingStatus === 'cancelled';

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Printable / Renderable Ticket Container */}
      <div
        ref={ticketRef}
        className="relative bg-cinema-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all"
      >
        {/* Status Header Banner */}
        <div
          className={`px-6 py-2.5 flex items-center justify-between text-xs font-bold ${
            isCancelled
              ? 'bg-rose-500/20 text-rose-400 border-b border-rose-500/30'
              : 'bg-gradient-to-r from-brand-600 to-rose-500 text-white'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" />
            <span className="tracking-wider uppercase">SmartCine Digital Admission</span>
          </div>
          <span className="font-mono tracking-wider">
            {isCancelled ? 'CANCELLED' : 'CONFIRMED'}
          </span>
        </div>

        {/* Main Ticket Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Left: Movie Poster */}
          <div className="sm:col-span-1 flex flex-col items-center">
            <div className="w-28 sm:w-full aspect-[2/3] rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/80 shadow-md">
              <img
                src={movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300'}
                alt={movie.title}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            </div>
            <span className="mt-2.5 px-2.5 py-0.5 rounded-full bg-brand-950 border border-brand-500/30 text-brand-300 font-bold text-[10px] uppercase">
              {show.format || '2D'} • {show.language || movie.language?.[0] || 'Original'}
            </span>
          </div>

          {/* Right: Show & Booking Information */}
          <div className="sm:col-span-2 flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-xl font-black text-white leading-tight">{movie.title}</h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
                <span>{theatre.name || 'Cinema'}, {theatre.city}</span>
              </p>
              <p className="text-[11px] text-slate-500 pl-4">{screen.name || 'Auditorium 1'}</p>
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800/80 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Date</span>
                <p className="font-bold text-white flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-500" />
                  {show.date || 'Today'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Showtime</span>
                <p className="font-bold text-white flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-brand-500" />
                  {show.startTime || '18:00'}
                </p>
              </div>
            </div>

            {/* Seat Numbers */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Reserved Seats</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {seats.map((s) => (
                  <span
                    key={s.seatId || `${s.row}-${s.number}`}
                    className="px-2.5 py-1 rounded-lg bg-brand-600/20 border border-brand-500/40 text-brand-300 font-bold text-xs"
                  >
                    {s.row}{s.number}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Perforated Notch Divider */}
        <div className="relative border-t-2 border-dashed border-slate-800 my-1">
          <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[#090a0f] border-r border-slate-800"></div>
          <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-[#090a0f] border-l border-slate-800"></div>
        </div>

        {/* Ticket Footer with QR Code & Booking Ref */}
        <div className="p-6 sm:px-8 bg-cinema-850/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500">Booking Reference</span>
            <p className="font-mono text-base font-black text-brand-400 tracking-wider">
              {bookingReference}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Paid: <span className="text-white font-bold">₹{totalAmount}</span>
            </p>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center">
            {qrCode ? (
              <img
                src={qrCode}
                alt="Ticket QR Code"
                className="w-20 h-20 rounded-xl bg-white p-1 shadow-md"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center p-1 text-slate-900 font-mono text-[9px] text-center">
                <QrCode className="w-12 h-12 text-slate-900" />
              </div>
            )}
            <span className="text-[9px] text-slate-500 mt-1 uppercase font-semibold">Scan at Entrance</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" /> Download PDF Ticket
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cinema-850 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>

          {/* Cancellation button if eligible */}
          {canCancel && onCancelBooking && !isCancelled && (
            <button
              onClick={() => onCancelBooking(booking)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all"
            >
              <XCircle className="w-4 h-4" /> Cancel Booking
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketCard;
