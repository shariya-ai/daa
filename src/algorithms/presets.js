/**
 * BudgetTrail - Preset Orienteering Scenarios
 */

export const PRESET_SCENARIOS = [
  {
    id: 'scenic_trap',
    name: '1. The Scenic Tour Trap (Greedy Trap)',
    tag: 'Heuristic Trap',
    color: '#f59e0b',
    description: 'Greedy is lured into low-reward nearby cafes (R=2, Stay=12m), exhausting the budget. DP skips them and visits high-reward summits (R=10, 9) scoring +250% more reward!',
    depot: { x: 140, y: 260, name: 'Basecamp Hotel' },
    budget: 135,
    speed: 80,
    returnToStart: true,
    places: [
      { id: 1, name: 'Local Souvenir Cafe', x: 190, y: 250, reward: 2, stayTime: 12, category: 'cafe' },
      { id: 2, name: 'Town Fountain Square', x: 230, y: 270, reward: 2, stayTime: 12, category: 'landmark' },
      { id: 3, name: 'Mini Botanical Park', x: 260, y: 230, reward: 3, stayTime: 14, category: 'park' },
      { id: 4, name: 'Artisan Bakery', x: 290, y: 280, reward: 2, stayTime: 10, category: 'cafe' },
      { id: 5, name: 'Eagle Crest Alpine Summit', x: 520, y: 130, reward: 10, stayTime: 8, category: 'viewpoint' },
      { id: 6, name: 'Grand Historic Citadel', x: 570, y: 210, reward: 9, stayTime: 10, category: 'museum' },
      { id: 7, name: 'Sunset Panoramic Plateau', x: 490, y: 350, reward: 9, stayTime: 8, category: 'viewpoint' }
    ]
  },
  {
    id: 'time_crunch',
    name: '2. Strict Time Crunch (Tight Budget)',
    tag: 'Edge Case',
    color: '#ef4444',
    description: 'Budget is razor-thin (65 min). The vehicle must precisely account for return travel time to depot. Only the highest density reward cluster is reachable.',
    depot: { x: 300, y: 240, name: 'Central Expedition HQ' },
    budget: 65,
    speed: 90,
    returnToStart: true,
    places: [
      { id: 1, name: 'North Observatory', x: 290, y: 90, reward: 8, stayTime: 10, category: 'viewpoint' },
      { id: 2, name: 'East Science Pavilion', x: 490, y: 220, reward: 9, stayTime: 12, category: 'museum' },
      { id: 3, name: 'South Garden Terrace', x: 320, y: 390, reward: 6, stayTime: 8, category: 'park' },
      { id: 4, name: 'West Valley Sanctuary', x: 100, y: 250, reward: 7, stayTime: 15, category: 'landmark' },
      { id: 5, name: 'Downtown Plaza', x: 340, y: 200, reward: 4, stayTime: 6, category: 'landmark' }
    ]
  },
  {
    id: 'metropolis_marathon',
    name: '3. Metropolis Sightseeing Marathon (n=12)',
    tag: 'Real-World Tour',
    color: '#06b6d4',
    description: 'A full 12-attraction city grid with diverse stay times and rewards across 4 geographic quadrants.',
    depot: { x: 350, y: 240, name: 'Grand Central Station' },
    budget: 240,
    speed: 85,
    returnToStart: true,
    places: [
      { id: 1, name: 'Modern Art Museum', x: 450, y: 120, reward: 9, stayTime: 20, category: 'museum' },
      { id: 2, name: 'Skydeck Tower', x: 550, y: 160, reward: 10, stayTime: 18, category: 'viewpoint' },
      { id: 3, name: 'Royal Waterfront Garden', x: 520, y: 340, reward: 7, stayTime: 15, category: 'park' },
      { id: 4, name: 'Old Town Clocktower', x: 420, y: 380, reward: 6, stayTime: 12, category: 'landmark' },
      { id: 5, name: 'Gourmet Food Market', x: 280, y: 390, reward: 5, stayTime: 15, category: 'cafe' },
      { id: 6, name: 'Heritage Cathedral', x: 170, y: 330, reward: 8, stayTime: 16, category: 'landmark' },
      { id: 7, name: 'River Walkway Promenade', x: 140, y: 220, reward: 4, stayTime: 10, category: 'park' },
      { id: 8, name: 'National Science Dome', x: 180, y: 110, reward: 9, stayTime: 22, category: 'museum' },
      { id: 9, name: 'Botanical Biosphere', x: 300, y: 90, reward: 6, stayTime: 14, category: 'park' },
      { id: 10, name: 'Historical Fort Bastion', x: 620, y: 260, reward: 8, stayTime: 15, category: 'landmark' },
      { id: 11, name: 'Artisan Coffee Roastery', x: 390, y: 180, reward: 3, stayTime: 8, category: 'cafe' },
      { id: 12, name: 'Harbor Lighthouse', x: 600, y: 410, reward: 7, stayTime: 12, category: 'viewpoint' }
    ]
  },
  {
    id: 'stepthrough_demo',
    name: '4. Step-Through Mini Demo (n=4)',
    tag: 'DP Stepper',
    color: '#10b981',
    description: 'Designed specifically for the Bitmask DP Table visualizer. Exactly 16 states (2^4) to easily trace recurrence relations and transitions.',
    depot: { x: 150, y: 220, name: 'Base Station' },
    budget: 150,
    speed: 75,
    returnToStart: true,
    places: [
      { id: 1, name: 'Alpha Point', x: 260, y: 130, reward: 8, stayTime: 10, category: 'landmark' },
      { id: 2, name: 'Beta Ridge', x: 440, y: 150, reward: 10, stayTime: 15, category: 'viewpoint' },
      { id: 3, name: 'Gamma Valley', x: 410, y: 310, reward: 6, stayTime: 12, category: 'park' },
      { id: 4, name: 'Delta Clinic', x: 230, y: 330, reward: 4, stayTime: 8, category: 'cafe' }
    ]
  },
  {
    id: 'drone_relay',
    name: '5. Drone Survey Relay (n=14)',
    tag: 'Large Instance',
    color: '#8b5cf6',
    description: 'Battery-limited autonomous aerial survey with 14 high-value sensor nodes across a wide territory.',
    depot: { x: 350, y: 250, name: 'Drone Launch Pad' },
    budget: 260,
    speed: 110,
    returnToStart: true,
    places: [
      { id: 1, name: 'Sensor Alpha', x: 120, y: 100, reward: 7, stayTime: 8, category: 'landmark' },
      { id: 2, name: 'Solar Array Station', x: 240, y: 80, reward: 9, stayTime: 10, category: 'museum' },
      { id: 3, name: 'Relay Tower North', x: 390, y: 70, reward: 10, stayTime: 12, category: 'viewpoint' },
      { id: 4, name: 'Weather Mast East', x: 550, y: 90, reward: 8, stayTime: 8, category: 'viewpoint' },
      { id: 5, name: 'Wind Turbine Beta', x: 620, y: 190, reward: 6, stayTime: 6, category: 'landmark' },
      { id: 6, name: 'Forest Monitoring Post', x: 600, y: 320, reward: 9, stayTime: 10, category: 'park' },
      { id: 7, name: 'Hydroelectric Dam', x: 500, y: 410, reward: 10, stayTime: 14, category: 'museum' },
      { id: 8, name: 'Seismic Station South', x: 360, y: 430, reward: 8, stayTime: 9, category: 'landmark' },
      { id: 9, name: 'Agricultural Probe', x: 210, y: 400, reward: 5, stayTime: 6, category: 'park' },
      { id: 10, name: 'Geothermal Borehole', x: 100, y: 340, reward: 7, stayTime: 10, category: 'landmark' },
      { id: 11, name: 'Wildlife Cam Station', x: 80, y: 220, reward: 4, stayTime: 5, category: 'park' },
      { id: 12, name: 'Central Radar Link', x: 260, y: 200, reward: 8, stayTime: 8, category: 'viewpoint' },
      { id: 13, name: 'Micro-Grid Transformer', x: 440, y: 210, reward: 6, stayTime: 7, category: 'cafe' },
      { id: 14, name: 'Optical Telemetry Hub', x: 370, y: 330, reward: 9, stayTime: 10, category: 'museum' }
    ]
  }
];
