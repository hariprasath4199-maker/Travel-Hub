import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Plane, 
  Star, 
  FileText, 
  Download, 
  Send,
  FileIcon
} from 'lucide-react';
import { MOCK_REQUESTS } from '@/src/constants';
import { StatusBadge } from '@/src/components/StatusBadge';

export default function RequestDetail() {
  const { id } = useParams();
  const request = MOCK_REQUESTS.find(r => r.id === id) || MOCK_REQUESTS[0];

  return (
    <div className="min-h-screen bg-surface-container-low">
      {/* Contextual Action Bar */}
      <div className="sticky top-16 z-30 flex items-center justify-between px-8 py-4 bg-white/60 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center gap-4">
          <Link to="/requests" className="p-2 rounded-lg hover:bg-surface-container transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold tracking-tight">{request.id}: EMEA Strategy Summit</h2>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-xs text-on-surface-variant font-medium">Submitted by {request.employeeName} • 2 days ago</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 text-sm font-semibold text-error hover:bg-error/5 rounded-lg transition-colors active:scale-95">Deny Request</button>
          <button className="px-5 py-2.5 text-sm font-semibold text-primary-dim hover:bg-primary/5 rounded-lg transition-colors active:scale-95">Request More Info</button>
          <button className="px-6 py-2.5 text-sm font-bold text-on-primary bg-gradient-to-br from-primary to-primary-dim rounded-lg shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95">Approve Request</button>
        </div>
      </div>

      <div className="p-8 grid grid-cols-12 gap-8 max-w-[1600px] mx-auto">
        {/* Left Column: Details */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          {/* Bento Section: Employee & Overview */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Employee Information</h3>
              <div className="flex items-center gap-4">
                <img alt="Traveler" className="w-14 h-14 rounded-xl object-cover" src={request.avatar} />
                <div>
                  <p className="text-lg font-bold">{request.employeeName}</p>
                  <p className="text-sm text-on-surface-variant">{request.role} • Madrid Office</p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-[10px] px-2 py-0.5 bg-surface-container rounded font-bold">VIP TRAVELER</span>
                    <span className="text-[10px] px-2 py-0.5 bg-surface-container rounded font-bold">NO ALERTS</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Purpose & Priority</h3>
              <p className="text-on-surface leading-relaxed text-sm">
                Quarterly strategy alignment for EMEA region. Critical for Q3 planning and budget approval. Requires proximity to the central hub for local team meetings.
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  <span className="text-sm font-semibold">{request.dates}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-primary" />
                  <span className="text-sm font-semibold">{request.destination}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Detailed Itinerary Section */}
          <section className="p-8 bg-surface-container-lowest rounded-xl shadow-sm">
            <div className="flex justify-between items-end mb-8">
              <h3 className="text-lg font-extrabold tracking-tight">Itinerary Details</h3>
              <span className="text-sm font-medium text-primary cursor-pointer hover:underline">View Full Map View</span>
            </div>
            
            {/* Flight Segment */}
            <div className="relative pl-8 mb-12">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-surface-container-highest"></div>
              <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-white"></div>
              <div className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-2xl font-black font-headline tracking-tighter">MAD</p>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">10:45 AM</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 w-32">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase">IBERIA IB3162</p>
                    <div className="w-full h-[1px] bg-outline-variant relative">
                      <Plane size={18} className="absolute left-1/2 -translate-x-1/2 -top-[9px] bg-surface-container-low px-0.5 text-primary fill-primary" />
                    </div>
                    <p className="text-[10px] text-on-surface-variant font-medium">2h 15m</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black font-headline tracking-tighter">LHR</p>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">12:00 PM</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">Business Class</p>
                  <p className="text-xs text-on-surface-variant">Seat 4C • Meal Selected</p>
                </div>
              </div>
            </div>

            {/* Hotel Segment */}
            <div className="relative pl-8">
              <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-tertiary ring-4 ring-white"></div>
              <div className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      alt="Hotel" 
                      className="w-full h-full object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuApZip_5QsHokiCZYv9BC1S_ReKW_d8ZW22DDx8m68dfrGp3cVS1gGhcg3n9cwbyMPRMnp6PbSet3AUK12_ARzRmDMaLjgYnTwOtuZ3ElwcXsbgBQtcNZAh-Uk7LoXRaZZG54OhMi4PYsYfmwyAXuOJEWpAKdvBzTiGVCik15Gd6HcO-wC2GqqCg3qY4_uGaq2Hxo-H4W7k8k5tqw_bBKXY9wBrr-JDXTbGiz6BdqGGhICnPSKf5v5GhuJ38H-8_YbBBGvsYG6bCagp" 
                    />
                  </div>
                  <div>
                    <p className="text-lg font-bold">The Savoy London</p>
                    <p className="text-sm text-on-surface-variant">Strand, London WC2R 0EZ</p>
                    <div className="mt-2 flex items-center gap-4">
                      <span className="text-xs font-semibold flex items-center gap-1">
                        <Star size={16} className="text-tertiary fill-tertiary" /> 4.9 Rating
                      </span>
                      <span className="text-xs font-semibold text-on-surface-variant">6 Nights</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">Luxury King Room</p>
                  <p className="text-xs text-on-surface-variant">Breakfast Included</p>
                </div>
              </div>
            </div>
          </section>

          {/* Budget Breakdown Section */}
          <section className="p-8 bg-surface-container-lowest rounded-xl shadow-sm">
            <h3 className="text-lg font-extrabold tracking-tight mb-6">Estimated Budget</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-4 bg-surface-container-low rounded-lg">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Flights</p>
                <p className="text-2xl font-black font-headline text-primary">$840.00</p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-lg">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Lodging</p>
                <p className="text-2xl font-black font-headline text-primary">$2,450.00</p>
              </div>
              <div className="p-4 bg-surface-container-low rounded-lg">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Per Diem</p>
                <p className="text-2xl font-black font-headline text-primary">$900.00</p>
              </div>
              <div className="p-4 bg-primary text-on-primary rounded-lg shadow-lg">
                <p className="text-xs font-bold opacity-80 uppercase mb-1">Total</p>
                <p className="text-2xl font-black font-headline">$4,190.00</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar Actions/Info */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
          {/* Attached Documents */}
          <section className="p-6 bg-surface-container-lowest rounded-xl shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Attached Documents</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-outline-variant/20 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-error" />
                  <p className="text-sm font-semibold">Iberia_Quote_3162.pdf</p>
                </div>
                <Download size={18} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center justify-between p-3 border border-outline-variant/20 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <FileIcon size={20} className="text-primary" />
                  <p className="text-sm font-semibold">Summit_Agenda.docx</p>
                </div>
                <Download size={18} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </section>

          {/* Audit Trail */}
          <section className="p-6 bg-surface-container-lowest rounded-xl shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Audit Trail</h3>
            <div className="space-y-6">
              <div className="relative pl-6">
                <div className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full bg-tertiary"></div>
                <p className="text-sm font-bold">Policy Check Passed</p>
                <p className="text-xs text-on-surface-variant">System Automated • Today, 9:20 AM</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full bg-primary"></div>
                <p className="text-sm font-bold">Request Submitted</p>
                <p className="text-xs text-on-surface-variant">Elena Rodriguez • Oct 1, 4:15 PM</p>
              </div>
              <div className="relative pl-6">
                <div className="absolute left-0 top-1 w-2.5 h-2.5 rounded-full bg-outline-variant"></div>
                <p className="text-sm font-bold">Request Created</p>
                <p className="text-xs text-on-surface-variant">Elena Rodriguez • Oct 1, 2:10 PM</p>
              </div>
            </div>
          </section>

          {/* Internal Comments */}
          <section className="p-6 bg-surface-container-lowest rounded-xl shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Internal Notes</h3>
            <div className="space-y-4 mb-6">
              <div className="bg-surface-container-low p-3 rounded-lg rounded-tl-none">
                <p className="text-xs font-bold text-primary mb-1">Marcus (Finance)</p>
                <p className="text-xs text-on-surface">Budget looks within threshold for EMEA summit. Previous trip to London was $4.5k.</p>
              </div>
            </div>
            <div className="relative">
              <textarea 
                className="w-full bg-surface-container-low border-none rounded-xl text-sm p-4 h-24 focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50 resize-none" 
                placeholder="Add a note for other admins..."
              ></textarea>
              <button className="absolute bottom-3 right-3 w-8 h-8 bg-primary text-on-primary rounded-lg flex items-center justify-center active:scale-95 transition-all shadow-md">
                <Send size={16} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
