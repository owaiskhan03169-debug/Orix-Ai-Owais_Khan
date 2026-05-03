const programs = [
  'Foundational learning for Nursery to Grade 2',
  'STEM labs, robotics, and project-based science',
  'Arts, sports, debate, music, and leadership clubs'
];

const stats = [
  { label: 'Students', value: '1,200+' },
  { label: 'Teachers', value: '85' },
  { label: 'Years', value: '28' }
];

function App() {
  return (
    <main>
      <section className="hero">
        <nav className="nav">
          <div className="brand">
            <span className="brand-mark">S</span>
            <span>Sunrise Public School</span>
          </div>
          <div className="links">
            <a href="#programs">Programs</a>
            <a href="#campus">Campus</a>
            <a href="#contact">Contact</a>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Admissions open 2026</p>
            <h1>Where curiosity becomes confidence.</h1>
            <p className="lead">
              A modern school website for a vibrant learning community with academics,
              co-curricular growth, safe campus life, and parent-first communication.
            </p>
            <div className="actions">
              <a className="button primary" href="#contact">Apply Now</a>
              <a className="button secondary" href="#programs">Explore Programs</a>
            </div>
          </div>

          <div className="notice-card">
            <h2>Upcoming Events</h2>
            <ul>
              <li>Science exhibition: May 18</li>
              <li>Parent orientation: May 24</li>
              <li>Sports trials: June 3</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="stats" aria-label="School highlights">
        {stats.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </section>

      <section id="programs" className="section">
        <div>
          <p className="eyebrow">Programs</p>
          <h2>Balanced academics with real-world skills</h2>
        </div>
        <div className="program-grid">
          {programs.map((program) => (
            <article key={program} className="program-card">
              <span className="dot" />
              <p>{program}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="campus" className="campus">
        <div>
          <p className="eyebrow">Campus Life</p>
          <h2>Designed for learning, play, and wellbeing</h2>
          <p>
            Smart classrooms, a library commons, turf field, maker lab, infirmary,
            and secure transport make every day structured and full of discovery.
          </p>
        </div>
      </section>

      <section id="contact" className="contact">
        <div>
          <p className="eyebrow">Contact</p>
          <h2>Book a campus visit</h2>
          <p>Call +91 98765 43210 or email admissions@sunriseschool.edu</p>
        </div>
        <form>
          <input aria-label="Parent name" placeholder="Parent name" />
          <input aria-label="Phone number" placeholder="Phone number" />
          <button type="button">Request Callback</button>
        </form>
      </section>
    </main>
  );
}

export default App;
