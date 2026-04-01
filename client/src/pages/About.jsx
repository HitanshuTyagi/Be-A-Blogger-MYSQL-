import { Heart, Code, Coffee, BookOpen } from 'lucide-react';

export default function About() {
  return (
    <div className="about-page">
      <div className="about-card">
        <div className="about-header">
          <BookOpen size={36} />
          <h1>About <span className="accent">Be A Blogger</span></h1>
        </div>

        <div className="about-content">
          <p>
            Welcome to <strong>Be A Blogger</strong> — a platform built for passionate writers, thinkers,
            and creators who want to share their ideas with the world.
          </p>

          <div className="about-features">
            <div className="about-feature">
              <Code size={24} />
              <h3>Built with Love</h3>
              <p>Crafted using modern web technologies — React, Node.js, Express, and MySQL.</p>
            </div>
            <div className="about-feature">
              <Coffee size={24} />
              <h3>Simple & Clean</h3>
              <p>A distraction-free writing experience so you can focus on what matters — your content.</p>
            </div>
            <div className="about-feature">
              <Heart size={24} />
              <h3>Community Driven</h3>
              <p>Like posts, leave comments, and connect with fellow bloggers in a supportive community.</p>
            </div>
          </div>

          <div className="about-mission">
            <h2>Our Mission</h2>
            <p>
              We believe everyone has a story worth telling. Our mission is to provide a beautiful,
              easy-to-use platform where anyone can start blogging — no technical skills required.
              Whether you're sharing travel adventures, tech tutorials, or personal reflections,
              Be A Blogger is your home.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
