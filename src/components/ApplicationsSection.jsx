import React from 'react';
import { REAL_WORLD_APPLICATIONS } from '../data/applicationsData';
import { Layers, Compass, Plane, Zap, Briefcase, Waves, Sparkles } from 'lucide-react';

export function ApplicationsSection() {
  const iconMap = {
    Compass: Compass,
    Plane: Plane,
    Zap: Zap,
    Briefcase: Briefcase,
    Waves: Waves
  };

  const carouselItems = [...REAL_WORLD_APPLICATIONS, ...REAL_WORLD_APPLICATIONS];

  return (
    <section id="applications" className="applications-carousel-section">
      
      {/* Section Header */}
      <div className="section-header-centered">
        <div className="section-eyebrow">
          <Layers size={14} /> Real-World Impact & Industry Applications
        </div>
        <h2 className="section-title">
          Where the Orienteering Problem Drives Value
        </h2>
        <p className="section-subtitle">
          From autonomous drone inspections to urban tourism and EV parcel delivery, time-budget optimization maximizes mission yield under finite energy constraints.
        </p>
      </div>

      {/* Infinite Horizontal Marquee Carousel */}
      <div className="infinite-marquee-container">
        <div className="infinite-marquee-track">
          {carouselItems.map((app, idx) => {
            const Icon = iconMap[app.icon] || Compass;
            const rot = (idx % 2 === 0 ? -1.5 : 1.5) * ((idx % 3) + 0.5);

            return (
              <div
                key={`${app.id}-${idx}`}
                className="paper-application-card"
                style={{
                  transform: `rotate(${rot}deg)`
                }}
              >
                <div className="paper-card-top">
                  <div className="paper-icon-box" style={{ background: 'rgba(242, 196, 106, 0.25)', color: '#4C4541' }}>
                    <Icon size={22} />
                  </div>
                  <span className="paper-category-tag" style={{ color: '#4C4541', borderColor: 'rgba(76, 69, 65, 0.2)' }}>
                    {app.category}
                  </span>
                </div>

                <h3 className="paper-card-title">{app.title}</h3>
                <h4 className="paper-card-subtitle">{app.subtitle}</h4>

                <p className="paper-card-desc">{app.description}</p>

                <div className="paper-math-box">
                  <strong>📐 Mathematical Constraint:</strong>
                  <span>{app.mathModel}</span>
                </div>

                <div className="paper-impact-tag">
                  <Sparkles size={13} color="#4C4541" />
                  <span>{app.impact}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
