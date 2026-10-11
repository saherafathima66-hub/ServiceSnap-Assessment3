/**
 * sampleData.js — Fictional demonstration data for ServiceSnap.
 *
 * All names, addresses, phone numbers, and companies are entirely fictional.
 * This data exists only in the browser session and resets on refresh.
 */

export const sampleServices = [
  {
    id: 1,
    title: 'Sanitary Bin Collection',
    provider: 'CleanCare Services',
    site: 'Melbourne Office Tower',
    date: '2026-09-22',
    time: '09:00',
    status: 'upcoming',
    notes: 'Weekly collection from all restroom levels. Replace liners.',
  },
  {
    id: 2,
    title: 'Office Cleaning',
    provider: 'CleanCare Services',
    site: 'Melbourne Office Tower',
    date: '2026-09-25',
    time: '07:30',
    status: 'upcoming',
    notes: 'Full clean of floors 1–3. Focus on kitchen and common areas.',
  },
  {
    id: 3,
    title: 'Waste Collection',
    provider: 'Metro Waste Solutions',
    site: 'Docklands Business Hub',
    date: '2026-09-30',
    time: '14:00',
    status: 'upcoming',
    notes: 'General and recycling bins. Ensure skip is accessible from rear lane.',
  },
  {
    id: 4,
    title: 'Air Freshener Servicing',
    provider: 'CleanCare Services',
    site: 'Melbourne Office Tower',
    date: '2026-10-03',
    time: '10:00',
    status: 'upcoming',
    notes: 'Replace cartridges in all dispensers on levels 1–3.',
  },
  {
    id: 5,
    title: 'Office Cleaning',
    provider: 'CleanCare Services',
    site: 'Southbank Corporate Centre',
    date: '2026-09-15',
    time: '18:00',
    status: 'completed',
    notes: 'Full clean completed. Client noted excellent results in meeting rooms.',
  },
  {
    id: 6,
    title: 'Waste Collection',
    provider: 'Metro Waste Solutions',
    site: 'Southbank Corporate Centre',
    date: '2026-09-10',
    time: '08:30',
    status: 'completed',
    notes: 'All bins collected. Recycling sorted on-site per client request.',
  },
  {
    id: 7,
    title: 'Sanitary Bin Collection',
    provider: 'CleanCare Services',
    site: 'Docklands Business Hub',
    date: '2026-09-12',
    time: '11:00',
    status: 'completed',
    notes: 'All bins serviced and liners replaced. No issues reported.',
  },
  {
    id: 8,
    title: 'Air Freshener Servicing',
    provider: 'CleanCare Services',
    site: 'Docklands Business Hub',
    date: '2026-09-08',
    time: '15:00',
    status: 'reported',
    notes: 'Dispenser on level 2 was not serviced. Cartridge still empty.',
  },
]

export const sampleSites = [
  {
    id: 1,
    name: 'Melbourne Office Tower',
    address: '120 Collins Street, Melbourne CBD 3000',
    contact: 'Jane Mitchell',
    phone: '03-9555-0101',
    notes: 'Main client site. 3 floors, access via loading dock on Flinders Lane.',
  },
  {
    id: 2,
    name: 'Docklands Business Hub',
    address: '88 Harbour Esplanade, Docklands 3008',
    contact: 'Marcus Chen',
    phone: '03-9555-0242',
    notes: 'Large commercial building. Sign in at ground-floor reception.',
  },
  {
    id: 3,
    name: 'Southbank Corporate Centre',
    address: '55 City Road, Southbank 3006',
    contact: 'Priya Sharma',
    phone: '03-9555-0333',
    notes: 'After-hours access required for most services. Security desk on ground floor.',
  },
]