/**
 * Real-world applications data for the Orienteering Problem
 */

export const REAL_WORLD_APPLICATIONS = [
  {
    id: 'tourist_itinerary',
    title: 'Smart City Tourist Day Planner',
    subtitle: 'Maximize Sightseeing Pleasure within an 8-Hour Transit Pass',
    category: 'Urban Mobility',
    color: '#06b6d4',
    icon: 'Compass',
    description: 'Tourists visiting cities like Tokyo, Paris, or London want to see as many top-rated sights as possible before their evening flight, subject to train travel times and museum entry queues.',
    mathModel: 'Objective: Maximize TripAdvisor Ratings sum; Budget: 480 minutes; Stay Time: 45-90 min queue & tour.',
    impact: '+42% higher traveler satisfaction score vs static guidebook itineraries.'
  },
  {
    id: 'drone_inspection',
    title: 'Autonomous Drone Infrastructure Inspection',
    subtitle: 'High-Value Sensor Data Harvesting on Limited Battery Charge',
    category: 'Robotics & UAVs',
    color: '#10b981',
    icon: 'Plane',
    description: 'Quadcopters inspecting offshore wind farms or power transmission lines have a strictly capped 35-minute lithium battery flight window. They must collect imagery from highest-priority turbine nacelles and return to the mothership.',
    mathModel: 'Objective: Maximize Critical Fault Detection Score; Budget: 35 min flight time; Constraint: Return-to-vessel.',
    impact: 'Zero battery exhaustion incidents across 12,000 automated inspection sorties.'
  },
  {
    id: 'ev_roadtrip',
    title: 'Electric Vehicle Commercial Route Planner',
    subtitle: 'Priority Deliveries within Fleet Shift Hours & Charging Delays',
    category: 'Logistics & Supply Chain',
    color: '#f59e0b',
    icon: 'Zap',
    description: 'EV logistics vans in metropolitan areas must serve high-margin parcel lockers while factoring in mandatory 20-minute Level-3 DC fast-charging intervals and driver 8-hour shift limits.',
    mathModel: 'Objective: Maximize On-Demand Parcel Delivery Revenue; Budget: 480 min driver shift.',
    impact: '18% reduction in overtime penalties and 26% more express packages fulfilled.'
  },
  {
    id: 'sales_rep',
    title: 'Enterprise Sales Route Optimization',
    subtitle: 'Client Pitch Prioritization for Maximum Contract Conversion',
    category: 'Business Operations',
    color: '#8b5cf6',
    icon: 'Briefcase',
    description: 'B2B pharmaceutical or enterprise software sales representatives in a metro area have a single business day to pitch doctors or CTOs. They prioritize clients with highest deal size and close probability.',
    mathModel: 'Objective: Maximize Expected Pipeline Value ($); Budget: 9 AM - 5 PM business day.',
    impact: 'Average pipeline closure increased by $140,000 per sales territory per quarter.'
  },
  {
    id: 'auv_reef',
    title: 'Autonomous Underwater Vehicle (AUV) Coral Survey',
    subtitle: 'Marine Ecology Data Collection under Oxygen & Depth Limits',
    category: 'Environmental Science',
    color: '#38bdf8',
    icon: 'Waves',
    description: 'Underwater robotic gliders surveying the Great Barrier Reef collect high-resolution sonar & water chemistry samples at endangered biodiversity waypoints before needing recovery by surface research vessels.',
    mathModel: 'Objective: Maximize Coral Health Sensor Yield; Budget: 6-hour dive window.',
    impact: '3x more endangered coral colonies mapped per survey cruise.'
  }
];
