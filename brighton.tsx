import React from 'react';

const BrightonPage = () => {
  return (
    <>
<div className="submission-links">
        {/* Share Section */}
        <div className="card-grid">
            <article className="card" aria-labelledby="session-heading">
                <div className="card-content">
                    <h2 id="session-heading">Session (July 14, 5:00pm - 5:45pm)</h2>
                    <p>Share your results from the vibe coding session.</p>
                </div>
                <footer className="card-footer">
                    <a href="https://docs.google.com/spreadsheets/d/1n0CIkVwaxRa9AHKmZ3__AWV7yAst9XYNO7vImbxZ9cc/edit?gid=0#gid=0" target="_blank" rel="noopener noreferrer">
                        Share your App
                    </a>
                </footer>
            </article>
        </div>

        <hr className="section-divider" />

        {/* Slides & Feedback Section */}
        <div className="card-grid">
            <article className="card" aria-labelledby="slides-heading">
                <div className="card-content">
                    <h2 id="slides-heading">Presentation Slides</h2>
                    <p>View the presentation slides from the sessions here.</p>
                </div>
                <footer className="card-footer">
                    <a href="https://docs.google.com/presentation/d/1NMRKFgY7-oweuKhRcmD4-14UvvSEO3C5xQll6z1tCKE/edit?usp=sharing" target="_blank" rel="noopener noreferrer">
                        View Slides
                    </a>
                </footer>
            </article>
            <article className="card" aria-labelledby="feedback-heading">
                <div className="card-content">
                    <h2 id="feedback-heading">Session Feedback</h2>
                    <p>Please share your feedback on the sessions to help us improve.</p>
                </div>
                <footer className="card-footer">
                    <a href="https://docs.google.com/forms/d/e/1FAIpQLSdoWA2hQPl_cV5fdv_FTQ9sigd6zUeOWdWL05F_O2_JFQYaRA/viewform?usp=sharing&ouid=105005710423946377208" target="_blank" rel="noopener noreferrer">
                        Open Feedback Form
                    </a>
                </footer>
            </article>
        </div>
        
        <hr className="section-divider" />

        {/* Presenter Section */}
        <div>
            <article className="card" aria-labelledby="presenter-heading">
                <div className="card-content">
                    <h2 id="presenter-heading">Presenter</h2>
                    <p>Tyson Roberts<br/>Software Engineer<br/>nall@deepmind.com</p>
                </div>
                <footer className="card-footer">
                    <a href="mailto:nall@deepmind.com">
                        Email
                    </a>
                </footer>
            </article>
        </div>
      </div>
    </>
  );
};

export default BrightonPage;