// Single source of truth for all site content. Text comes from the BTGC company profile + project brief.

export const site = {
  name: 'BTGC Group',
  legal: 'Bright Theme General Contracting SP LLC',
  url: 'https://www.btgc-uae.com',
  phone: '+971 50 969 9436',
  phoneHref: 'tel:+971509699436',
  email: 'info@btgcgroup.com',
  web: 'www.btgc-uae.com',
  year: 2026,
  adAddress: ['Office #203, 2nd Floor, FAB Properties, Tower A,', 'behind City Season Hotel, Najda Street,', 'Abu Dhabi, UAE', 'P.O. Box 114176'],
  dubaiAddress: '[Dubai office address – to be added]',
};

export const nav = [
  { label: 'About', href: 'about.html', key: 'about' },
  { label: 'Services', href: 'services.html', key: 'services', children: true },
  { label: 'Projects', href: 'projects.html', key: 'projects' },
  { label: 'Quality & HSE', href: 'quality-hse.html', key: 'quality' },
  { label: 'Certifications', href: 'certifications.html', key: 'certs' },
];

export const services = [
  {
    slug: 'mechanical', title: 'Mechanical (HVAC)', icon: 'wind', img: 'service-mechanical',
    short: 'Heat-load driven HVAC design, ventilation, pressurisation and controls.',
    overview: 'We provide complete mechanical engineering solutions, including heat load calculations, HVAC system design, equipment selection, air distribution, ventilation systems, pressurization systems and HVAC controls, delivering efficient, reliable and sustainable building services.',
    caps: ['Heat load calculations', 'HVAC system design & scheme development', 'Equipment selection & sizing', 'Air distribution & piping design', 'Ventilation systems', 'Staircase / lift-well pressurization', 'HVAC controls & automation'],
    related: ['wtc-hvac-bms-delta-t', 'deluxe-arabian-tailoring', 'bmbr-pool-mep', 'deliveroo'],
  },
  {
    slug: 'electrical', title: 'Electrical', icon: 'zap', img: 'service-electrical',
    short: 'HT/LT distribution, back-up power, cabling and panel engineering.',
    overview: 'We deliver comprehensive electrical engineering solutions, including system design, HT/LT distribution, electrical load calculations, back-up power arrangements, cabling and bus riser systems, and panel scheduling with cable sizing for safe and efficient building operations.',
    caps: ['Electrical system design', 'HT / LT distribution systems', 'Electrical load calculations', 'Back-up power arrangements', 'Cabling & bus riser systems', 'Panel schedules & cable sizing calculations'],
    related: ['adnoc-t3-emergency-power', 'wtc-hvac-bms-delta-t', 'kpmg-office-demerging', 'bmbr-pool-mep'],
  },
  {
    slug: 'phe-fire', title: 'PHE & Fire Protection', icon: 'flame', img: 'service-phe-fire',
    short: 'Water, drainage, sewage treatment, hydrants and sprinkler systems.',
    overview: 'We deliver comprehensive plumbing and fire protection solutions, including water demand calculations, water storage and distribution, drainage and waste systems, sewage treatment plants, and fire hydrant and sprinkler systems for reliable and efficient building operations.',
    caps: ['Water demand calculations', 'Water storage & distribution', 'Drainage & waste systems', 'Sewage treatment plants', 'Fire hydrant & sprinkler systems'],
    related: ['yas-mall-fls-retrofit', 'bmbr-pool-mep', 'kpmg-office-demerging', 'deliveroo'],
  },
  {
    slug: 'elv', title: 'ELV / Low Current', icon: 'network', img: 'service-elv',
    short: 'Fire alarm, PA, access control, BMS, telecom, CCTV and parking systems.',
    overview: 'Our extra-low-voltage division designs, installs, tests and commissions the systems that keep a building safe, connected and controllable — from fire alarm and public address to access control, CCTV, telecom and integrated building management.',
    caps: ['Fire alarm system', 'Public address system', 'Access control system', 'Integrated building management system (BMS)', 'Tele-communication system', 'CCTV system', 'Parking management system'],
    related: ['wtc-hvac-bms-delta-t', 'yas-mall-fls-retrofit', 'control-room-dalma-mall', 'adnoc-t3-emergency-power'],
  },
  {
    slug: 'civil', title: 'Civil Works', icon: 'layers', img: 'service-civil',
    short: 'Screeding, masonry, tiling, gypsum, aluminium & glass, steel, rubber flooring.',
    overview: 'Our Civil Works division provides reliable construction and finishing solutions for commercial, residential and industrial projects. Our services include floor screeding, masonry and tile works, gypsum and painting, aluminium and glass works, structural steel works and rubber flooring, delivered with a commitment to quality, safety and timely execution.',
    caps: ['Floor screeding', 'Masonry & tile works', 'Gypsum & paint works', 'Aluminium & glass works', 'Steel structure works', 'Rubber flooring'],
    related: ['office-square-modification', 'f06-unit-demolition', 'tamreen-building', 'deliveroo'],
  },
  {
    slug: 'interior-fitout', title: 'Interior & Fit-out', icon: 'layout-grid', img: 'service-interior-fitout',
    short: 'Design-and-build interiors, bespoke joinery, lighting and sanitary ware.',
    overview: 'Turnkey interior environments across commercial, corporate, retail, hospitality, healthcare and government sectors — combining interior design, bespoke joinery and furniture, lighting and sanitary-ware selection with disciplined project management.',
    caps: ['Interior design', 'Joinery & furniture', 'Lighting', 'Sanitary ware selection'],
    related: ['train-gym', 'grey-fitness-f45', 'montauk-boutique-cafe', 'american-community-school'],
  },
  {
    slug: 'maintenance', title: 'Maintenance', icon: 'wrench', img: 'service-maintenance',
    short: 'Building, cleaning, HVAC, electrical and plumbing maintenance.',
    overview: 'Long-term coverage that keeps assets performing: planned and reactive maintenance across building fabric, HVAC, electrical and plumbing systems, plus cleaning services — supported by a dedicated point of contact and scalable manpower.',
    caps: ['All kinds of building maintenance', 'All types of cleaning services', 'HVAC maintenance', 'Electrical maintenance', 'Plumbing maintenance'],
    related: ['wtc-hvac-bms-delta-t', 'tamreen-building', 'private-villa', 'deluxe-arabian-tailoring'],
  },
];

export const projectFilters = [
  { key: 'all', label: 'All' },
  { key: 'mep', label: 'MEP' },
  { key: 'fitout', label: 'Fit-out' },
  { key: 'renovation', label: 'Renovation' },
  { key: 'fls', label: 'Fire & Life Safety' },
  { key: 'electrical', label: 'Electrical' },
];

// kind drives the placeholder illustration style
export const projects = [
  { slug: 'adnoc-t3-emergency-power', title: 'Design & Build T3 Lift Emergency Power Supply', short: 'ADNOC Tower 3 — Lift Emergency Power', loc: 'ADNOC Tower 3, WTC Mall, Abu Dhabi', dur: '8 months', scope: 'Electrical / Design & Build', cats: ['electrical', 'mep'], kind: 'panel', case: true },
  { slug: 'wtc-hvac-bms-delta-t', title: 'HVAC & BMS Delta-T Upgrade', short: 'WTC Mall — HVAC & BMS Delta-T Upgrade', loc: 'WTC Mall, Abu Dhabi', dur: '10 months', scope: 'HVAC & Electrical', cats: ['mep', 'electrical'], kind: 'duct', case: true },
  { slug: 'yas-mall-fls-retrofit', title: 'FLS Retrofit Design & Build', short: 'Yas Mall — FLS Retrofit', loc: 'Yas Mall, Abu Dhabi', dur: '10 months', scope: 'Fire & Life Safety', cats: ['fls'], kind: 'sprinkler', case: true },
  { slug: 'bmbr-pool-mep', title: 'MEP Refurbishment for Swimming Pools', short: 'BMBR Tower — Pool MEP Refurbishment', loc: 'BMBR Tower (T2), WTC Mall, Abu Dhabi', dur: '6 months', scope: 'Renovation / MEP', cats: ['renovation', 'mep'], kind: 'duct', case: true },
  { slug: 'kpmg-office-demerging', title: 'KPMG Office Demerging & Modification', short: 'KPMG — Office Demerging', loc: 'Nation Towers Mall, Abu Dhabi', dur: '6 months', scope: 'Renovation / MEP', cats: ['renovation', 'mep'], kind: 'plan', case: true },
  { slug: 'office-square-modification', title: 'Office Square Modification', short: 'Office Square Modification', loc: 'Nation Towers Mall, Abu Dhabi', dur: '30 days', scope: 'Renovation', cats: ['renovation'], kind: 'plan', case: true },
  { slug: 'train-gym', title: 'Train Gym', loc: 'WTC Mall, Abu Dhabi', dur: '4 months', scope: 'Fit-out', cats: ['fitout'], kind: 'fitout' },
  { slug: 'libra-cafe', title: 'Libra Cafe', loc: 'Khalidiya, Abu Dhabi', dur: '3 months', scope: 'Fit-out', cats: ['fitout'], kind: 'fitout' },
  { slug: 'elated-beauty-bar-cafe', title: 'Elated Beauty Bar & Cafe', loc: 'Khalidiya, Abu Dhabi', dur: '3 months', scope: 'Fit-out', cats: ['fitout'], kind: 'fitout' },
  { slug: 'montauk-boutique-cafe', title: 'Montauk Boutique Café & Restaurant', loc: 'Al Bateen, Abu Dhabi', dur: '3 months', scope: 'Fit-out', cats: ['fitout'], kind: 'fitout' },
  { slug: 'that-cafe', title: 'That Cafe', loc: 'Al Bateen Tower, Abu Dhabi', dur: '3 months', scope: 'Fit-out', cats: ['fitout'], kind: 'fitout' },
  { slug: 'private-villa', title: 'Private Villa', loc: 'Abu Dhabi', dur: '3 months', scope: 'Renovation', cats: ['renovation'], kind: 'plan' },
  { slug: 'control-room-dalma-mall', title: 'Control Room', loc: 'Dalma Mall, Abu Dhabi', dur: '3 months', scope: 'Fit-out', cats: ['fitout'], kind: 'panel' },
  { slug: 'tamreen-building', title: 'Tamreen Building (Shops & Flats)', loc: 'Near WTC Mall, Abu Dhabi', dur: '30 days', scope: 'Renovation', cats: ['renovation'], kind: 'skyline' },
  { slug: 'deliveroo', title: 'Deliveroo', loc: 'WTC Mall, Abu Dhabi', dur: '60 days', scope: 'Civil & MEP', cats: ['mep'], kind: 'duct' },
  { slug: 'american-community-school', title: 'American Community School', loc: 'Abu Dhabi', dur: '3 months', scope: 'Fit-out', cats: ['fitout'], kind: 'fitout' },
  { slug: 'deluxe-arabian-tailoring', title: 'Deluxe Arabian Tailoring Shop', loc: 'Baniyas Mall, Abu Dhabi', dur: '1 month', scope: 'HVAC', cats: ['mep'], kind: 'duct' },
  { slug: 'grey-fitness-f45', title: 'Grey Fitness (F45)', loc: "Water's Edge, Abu Dhabi", dur: '65 days', scope: 'Complete fit-out', cats: ['fitout'], kind: 'fitout' },
  { slug: 'f06-unit-demolition', title: 'F06 Unit Demolition', loc: 'Nation Towers Mall, Abu Dhabi', dur: '30 days', scope: 'Demolition', cats: ['renovation'], kind: 'plan' },
  { slug: 'addax-tower', title: 'Addax Tower', loc: 'Reem Island, Abu Dhabi', dur: '3 months', scope: 'Fit-out', cats: ['fitout'], kind: 'skyline' },
];

// Narratives for the six featured case studies. Scope text is taken from the company profile;
// challenge/result framing is derived from it (no invented figures) — verify with the project team before launch.
export const cases = {
  'adnoc-t3-emergency-power': {
    client: 'ADNOC Tower 3, WTC Mall', services: ['electrical', 'elv'], model: 'Design & Build',
    lead: 'Complete design, engineering, supply, installation, testing and commissioning of the emergency power supply system for the lifts in Tower 3.',
    challenge: 'Lifts in a high-rise tower must keep operating when the grid drops. The emergency supply had to be engineered to the applicable safety standards and project requirements, and delivered inside a live commercial development.',
    solution: 'BTGC took single-point responsibility under a design-and-build contract: system design and engineering, equipment supply, installation, and full testing and commissioning of the emergency power supply for the Tower 3 lifts.',
    result: 'Uninterrupted lift operation during power outages, in compliance with applicable safety standards and project requirements — delivered in 8 months.',
  },
  'wtc-hvac-bms-delta-t': {
    client: 'WTC Mall', services: ['mechanical', 'electrical', 'elv'], model: 'HVAC & electrical works',
    lead: 'Upgrade of the HVAC and Building Management System to improve the performance and efficiency of the chilled water system.',
    challenge: 'The chilled water system needed to achieve its required Delta-T. Without it, cooling capacity is wasted and energy consumption rises.',
    solution: 'The works comprised HVAC system modifications, BMS optimisation, testing and commissioning, all aimed at achieving the required Delta-T across the chilled water system.',
    result: 'Improved cooling performance, reduced energy consumption and reliable system operation — delivered over 10 months.',
  },
  'yas-mall-fls-retrofit': {
    client: 'Yas Mall', services: ['phe-fire', 'elv'], model: 'Design & Build',
    lead: 'Design, supply, installation, testing and commissioning of Fire & Life Safety system upgrades and modifications to current codes and authority requirements.',
    challenge: 'Existing FLS systems had to be brought up to current fire and life safety regulations while the mall kept trading, with minimal disruption to daily operations.',
    solution: 'A design-and-build retrofit of the existing FLS systems in accordance with applicable codes and authority requirements, followed by testing and commissioning.',
    result: 'Enhanced safety, improved system reliability and compliance with current fire and life safety regulations, with minimal disruption to the mall’s daily operations.',
  },
  'bmbr-pool-mep': {
    client: 'BMBR Tower (T2), WTC Mall', services: ['mechanical', 'electrical', 'phe-fire', 'civil'], model: 'Demolition & renovation',
    lead: 'Refurbishment of the MEP systems serving the swimming pools, including demolition and renovation of existing tile finishes.',
    challenge: 'Pool facilities depend on mechanical, electrical and plumbing systems that must run safely and continuously. The existing systems needed replacing and upgrading alongside a full tile finish renovation.',
    solution: 'Replacement and upgrading of the mechanical, electrical and plumbing systems, demolition and renovation of the existing tile finishes, and testing and commissioning of the completed works.',
    result: 'Safe, reliable and efficient operation of the pool facilities, delivered over 6 months.',
  },
  'kpmg-office-demerging': {
    client: 'KPMG — Nation Towers Mall', services: ['civil', 'mechanical', 'electrical', 'phe-fire'], model: 'Renovation works',
    lead: 'Civil, mechanical, electrical and fire protection modification works to demerge an office area, with complete reinstatement of affected areas.',
    challenge: 'Splitting an existing office area touches every discipline at once — partitions, ceilings, doors, piping, power distribution and metering — and each affected area has to be reinstated cleanly.',
    solution: 'Coordinated execution of partitioning, ceiling and door works, piping modifications, electrical panel upgrades and metering systems, followed by testing, commissioning and complete reinstatement of affected areas.',
    result: 'A demerged, fully functional office area with independent services and every affected area reinstated — completed in 6 months.',
  },
  'office-square-modification': {
    client: 'Nation Towers Mall', services: ['civil', 'interior-fitout'], model: 'Renovation works',
    lead: 'Renovation and modification of the Office Square area, including demolition of existing finishes and civil and architectural renovation.',
    challenge: 'A compressed 30-day window to demolish existing finishes and deliver a space that is both more functional and visibly refreshed.',
    solution: 'Demolition of existing finishes followed by civil and architectural renovation works, planned and resourced to hold a 30-day programme.',
    result: 'Enhanced functionality and appearance of the Office Square area, delivered in 30 days.',
  },
};

export const phases = [
  { n: 1, title: 'Initiation', lead: 'Scope, team and site aligned before a single drawing is issued.', tasks: ['Appoint PM & MEP team', 'Define project scope & goals', 'Site survey & feasibility', 'Client & stakeholder buy-in'] },
  { n: 2, title: 'Design & Planning', lead: 'Coordinated MEP design, programme and cost locked in before work starts.', tasks: ['MEP shop drawings & design', 'Schedule & manpower plan', 'Budget & cost planning', 'Material submittals & approval'] },
  { n: 3, title: 'Procurement & Execution', lead: 'Supply and installation tracked against plan and coordinated with every trade.', tasks: ['Material procurement & logistics', 'HVAC, electrical & plumbing install', 'Progress tracking: plan vs actual', 'Coordination with other trades'] },
  { n: 4, title: 'Testing & Control', lead: 'Every system tested, balanced and inspected before it is signed off.', tasks: ['Testing, commissioning & balancing', 'Quality inspections & snagging', 'Change & scope control', 'Documentation control'] },
  { n: 5, title: 'Closure & Handover', lead: 'A clean handover with full documentation and warranty cover.', tasks: ['Final commissioning & handover', 'As-built drawings & O&M manuals', 'Defects liability & warranty', 'Close-out report & lessons learned'] },
];

// Clients shown in the "Trusted by" strip above the footer (names from the company profile).
// Drop an official logo at assets/img/clients/<slug>.svg|png|webp (use only logos you are authorised to display);
// until a file exists the tile shows the name as a text wordmark.
export const trusted = [
  { name: 'Ministry of Presidential Affairs', slug: 'ministry-of-presidential-affairs' },
  { name: 'ICT', slug: 'ict' },
  { name: 'Aldar', slug: 'aldar' },
  { name: 'Brand Folio', slug: 'brand-folio' },
  { name: 'Dalma Mall', slug: 'dalma-mall' },
  { name: 'ADNOC Tower 3 (WTC)', slug: 'adnoc-tower-3-wtc' },
  { name: 'Yas Mall', slug: 'yas-mall' },
  { name: 'Nation Towers Mall', slug: 'nation-towers-mall' },
  { name: 'KPMG', slug: 'kpmg' },
];

export const stats = [
  { value: 2018, from: 2000, prefix: '', suffix: '', title: 'Established', desc: 'Delivering MEP, civil and interior fit-out projects across the UAE since 2018.' },
  { value: 60, prefix: '', suffix: '+', title: 'Skilled staff', desc: 'Engineers, supervisors and technicians based in Abu Dhabi and Dubai.' },
  { value: 30, prefix: 'AED ', suffix: 'M', title: 'Projects in hand', desc: 'Approximate value of current work, with capacity ready for more.' },
  { value: 3, prefix: '', suffix: '', title: 'ISO certifications', desc: 'ISO 9001, ISO 14001 and ISO 45001 — quality, environment, health & safety.' },
];

export const why = [
  { t: 'High accuracy deliverables', i: 'target' },
  { t: 'Reduced managing responsibility', i: 'user-check' },
  { t: 'Cost savings', i: 'bar-chart' },
  { t: 'Quick turnaround', i: 'clock' },
  { t: 'Expertise across all engineering domains', i: 'layers' },
  { t: 'Experienced & skilled staff', i: 'hard-hat' },
  { t: 'Scalable manpower to meet deadlines', i: 'users' },
  { t: 'Dedicated point of contact', i: 'phone' },
  { t: 'Long-term coverage', i: 'refresh' },
  { t: 'Multiple business models', i: 'layout-grid' },
];

export const values = [
  { t: 'Integrity', d: 'Honest pricing, honest programmes, honest reporting — every time.', i: 'shield-check' },
  { t: 'Teamwork', d: 'One coordinated team across clients, consultants, trades and subcontractors.', i: 'users' },
  { t: 'Accountability', d: 'A dedicated point of contact owns every project from kick-off to handover.', i: 'clipboard-check' },
  { t: 'Excellence', d: 'A relentless pursuit of precision in quality, safety and finish.', i: 'award' },
];

export const strengths = [
  'Head office in Abu Dhabi with technical division and staff accommodation within a 2 km radius, plus a fully operational Dubai office offering the same facilities',
  'Strong local working experience in Abu Dhabi & Dubai',
  'Priority sourcing / supply of construction materials by sister-concern companies',
  'Sound financials with group stability',
  'Competent subcontractors',
  'Competent technical & management team with an adequate resource base',
];

export const resources = [
  { city: 'Abu Dhabi', items: ['Bright Theme General Contracting SP LLC', 'Bright Theme Engineering Consultants LLC', 'Warehouse / Store', 'Labour camp'] },
  { city: 'Dubai', items: ['Bright Theme General Contracting SP LLC (Dubai branch)', 'Theme Plus Technical Services LLC', 'Labour camp'] },
];

export const org = [
  { dept: 'Administration', roles: ['HR Manager', 'Admin', 'IT In-charge', 'Document Controller'] },
  { dept: 'QHSE', roles: ['QA/QC Engineer', 'HSE Officer'] },
  { dept: 'Estimation', roles: ['Quantity Surveyor', 'Procurement Engineer'] },
  { dept: 'Finance', roles: ['Accountant'] },
  { dept: 'Technical', roles: ['Project Manager', 'Civil Engineer', 'Electrical Engineer', 'Mechanical Engineer', 'MEP Draftsman', 'Civil Draftsman', 'Civil / Electrical / Mechanical Supervisors', 'Technicians', 'Helpers'] },
  { dept: 'Store', roles: ['Store Keeper', 'Store Assistant'] },
];

export const qualityPolicy = [
  'To exceed customer expectations by delivering high-quality construction using advanced technologies, innovative methods and best industry practices.',
  'To ensure continuous monitoring, control and improvement of quality at all stages of construction activities.',
  'To achieve and maintain quality through effective teamwork and close coordination with subcontractors, vendors and clients.',
  'To develop core competencies and enhance the skills of employees through regular training programs, awareness initiatives and workshops.',
  'BTGC maintains a well-established in-house Quality Management System and is committed to complying with the requirements of ISO 9001 Quality Management System Certification.',
];
export const qualityMgmt = [
  'Quality Management shall comprise the formulation of a project-specific Quality Plan and its implementation.',
  'BTGC acknowledges the need for quality execution of the project in addition to timely completion.',
  'All project personnel shall be enlightened about the customer’s expectations as regards Quality and the means to achieve them.',
  'BTGC shall deploy an experienced Quality Assurance Engineer for the satisfactory execution of the contract scope of works.',
];

export const hse = [
  { cat: 'Governance & documentation', items: [
    ['Document Management', 'file-text'], ['Management Review', 'refresh'], ['Legal Requirements', 'scale'], ['External Communications', 'megaphone'],
    ['HSE Performance Measurements', 'bar-chart'], ['Roles and Responsibilities', 'user-check'], ['HSE Monitoring Meetings', 'users'] ] },
  { cat: 'Risk & operational control', items: [
    ['Risk Management', 'alert'], ['Permit to Work Systems', 'clipboard-check'], ['Journey Management', 'navigation'], ['Sub-contractor Management', 'hard-hat'],
    ['Safety Audit', 'search'], ['HSE Inspection', 'eye'], ['Mobilization Safety Package', 'package'] ] },
  { cat: 'People & safety culture', items: [
    ['HSE Training Plan', 'graduation'], ['Toolbox Talks / Group Meetings', 'message'], ['Suggestion Scheme on Safety', 'lightbulb'],
    ['Safety Incentive Scheme', 'star'], ['Dealing with Safety Violations', 'alert'], ['Accident / Incident Reporting & Investigation', 'file-text'] ] },
  { cat: 'Site, health & environment', items: [
    ['Emergency Preparedness', 'life-buoy'], ['Housekeeping', 'home'], ['Waste Management', 'trash'], ['Pest Control & Hygiene Management', 'bug'],
    ['Heat Stress, Lighting, Ventilation & Noise', 'thermometer'], ['Selection, Procurement, Issue & Disposal of Safety Appliances', 'shield-check'] ] },
];

export const certs = [
  { slug: 'iso-9001-2015', title: 'ISO 9001:2015', sub: 'Quality Management System', meta: 'GIQ-CIS · valid to May 2029', icon: 'award', group: 'iso' },
  { slug: 'iso-14001-2015', title: 'ISO 14001:2015', sub: 'Environmental Management System', meta: 'GIQ-CIS · valid to May 2029', icon: 'leaf', group: 'iso' },
  { slug: 'iso-45001-2018', title: 'ISO 45001:2018', sub: 'Occupational Health & Safety', meta: 'GIQ-CIS · valid to May 2029', icon: 'shield-check', group: 'iso' },
  { slug: 'icv-certificate', title: 'ICV Certificate', sub: 'In-Country Value score', meta: '26.23%', icon: 'trending', group: 'gov' },
  { slug: 'dmt-contractor-classification', title: 'Abu Dhabi DMT Classification', sub: 'Engineering Contracting Classification', meta: 'Dept. of Municipalities & Transport', icon: 'building', group: 'gov' },
  { slug: 'abu-dhabi-economic-licence', title: 'Abu Dhabi Economic Licence', sub: 'Commercial trade licence', meta: 'Abu Dhabi', icon: 'file-text', group: 'lic' },
  { slug: 'dubai-licences', title: 'Dubai Professional & Commercial Licences', sub: 'Dubai branch operations', meta: 'Dubai', icon: 'file-text', group: 'lic' },
];

export const leaders = [
  { name: 'Ms. Rama Devi', role: 'Managing Director / Owner', img: 'team-rama-devi', bio: 'As the Owner and Managing Director of Bright Theme General Contracting, she provides the foundation for the organisation’s vision and long-term growth. The company operates with a strong commitment to quality, reliability and customer satisfaction, delivering professional contracting and engineering solutions across a wide range of projects.' },
  { name: 'Mr. Renu Ganesh', role: 'Chief Executive Officer', img: 'team-renu-ganesh', bio: 'Has over 20 years of experience in managing engineering and construction projects, with strong knowledge of the construction, commissioning, maintenance and execution of high-end MEP projects. With a practical approach and a commitment to quality, he plays a key role in the successful delivery of projects and the continuous growth of the company.' },
];

// Home hero "services slider" — one slide per service. Edit here, then `npm run build`.
// img = file stem inside assets/img/hero/: <stem>.avif (2560w, wide screens) + <stem>.webp/.jpg (1920w) + <stem>-1280.webp/.jpg.
// Images 4 and 5 are the same photo on purpose — swap in another file and re-run the conversion (see README).
// icon names match the navbar Services dropdown (see `services` above).
export const heroSlides = [
  { title: 'Mechanical (HVAC)', meta: 'MEP · Design & Build', line: 'HVAC design, ventilation and controls engineered for UAE climates.', icon: 'wind', img: '1', link: 'services/mechanical.html' },
  { title: 'Electrical', meta: 'MEP · Power Systems', line: 'HT/LT distribution, back-up power and panels built for zero downtime.', icon: 'zap', img: '2', link: 'services/electrical.html' },
  { title: 'PHE & Fire Protection', meta: 'MEP · Life Safety', line: 'Water, drainage, hydrant and sprinkler systems designed to code.', icon: 'flame', img: '3', link: 'services/phe-fire.html' },
  { title: 'ELV / Low Current', meta: 'Systems · Integration', line: 'Fire alarm, CCTV, access control and BMS in one intelligent building.', icon: 'network', img: '4', link: 'services/elv.html' },
  { title: 'Civil Works', meta: 'Civil · Finishing', line: 'Screeding, masonry, gypsum, glass and steel — precise and on time.', icon: 'layers', img: '5', link: 'services/civil.html' },
  { title: 'Interior & Fit-out', meta: 'Interiors · Turnkey', line: 'Design, joinery and fit-out for offices, retail and hospitality.', icon: 'layout-grid', img: 'interior', link: 'services/interior-fitout.html' },
  { title: 'Maintenance', meta: 'Facilities · Support', line: 'Planned and reactive HVAC, electrical and plumbing maintenance.', icon: 'wrench', img: '6', link: 'services/maintenance.html' },
];
