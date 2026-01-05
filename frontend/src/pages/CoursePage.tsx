import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCourse, fetchCourseReviews, fetchCourseResources } from '../api';
import { type Review, type Resource } from '../mockData';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'reviews' | 'resources'>('reviews');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'upvotes'>('upvotes');

  const { data: course, isLoading: courseLoading, error: courseError } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourse(Number(courseId)),
    enabled: !!courseId,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', courseId],
    queryFn: () => fetchCourseReviews(Number(courseId), 'recent'),
    enabled: !!courseId,
  });

  const { data: resources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ['resources', courseId, resourceFilter, sortBy],
    queryFn: () => fetchCourseResources(Number(courseId), resourceFilter, sortBy),
    enabled: !!courseId,
  });

  if (courseLoading) {
    return (
      <div>
        <Header />
        <div className="max-w-[1200px] mx-auto px-5 py-20 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-[#666]">Loading course...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div>
        <Header />
        <div className="max-w-[1200px] mx-auto px-5 py-20 text-center">
          <h1>Course not found</h1>
          <button onClick={() => navigate('/')} className="bg-[#333] text-white py-2.5 px-6 rounded-md mt-4">Back to Home</button>
        </div>
        <Footer />
      </div>
    );
  }

  const sortedReviews = [...reviews].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main>
        <section className="bg-gradient-to-b from-white to-[#f9f9f9] py-10 pb-[60px] border-b border-[#e0e0e0]">
          <div className="max-w-[1200px] mx-auto px-5">
            <button 
              className="bg-transparent border-none text-[#666] text-sm cursor-pointer mb-5 py-2 px-3 rounded-md transition-colors hover:bg-[#f0f0f0]" 
              onClick={() => navigate('/')}
            >
              ← Back to Courses
            </button>
            <div className="grid grid-cols-[1fr_auto] gap-10 items-start max-md:grid-cols-1">
              <div>
                <div className="text-base font-semibold text-maceng-maroon mb-2">{course.code}</div>
                <h1 className="font-playfair text-[42px] font-bold mb-4 text-[#222] max-md:text-[32px]">{course.title}</h1>
                <p className="text-lg text-[#666] leading-relaxed max-w-[700px]">{course.description}</p>
              </div>
              <div className="flex gap-5 max-md:w-full max-md:justify-between">
                <div className="bg-white py-5 px-6 rounded-xl border border-[#e0e0e0] text-center min-w-[120px] max-md:flex-1 max-md:min-w-[90px]">
                  <div className="text-2xl font-semibold text-[#333] mb-2">⭐ {course.rating.toFixed(1)}</div>
                  <div className="text-[13px] text-[#888]">Average Rating</div>
                </div>
                <div className="bg-white py-5 px-6 rounded-xl border border-[#e0e0e0] text-center min-w-[120px] max-md:flex-1 max-md:min-w-[90px]">
                  <div className="text-2xl font-semibold text-[#333] mb-2">📊 {course.difficulty.toFixed(1)}/5</div>
                  <div className="text-[13px] text-[#888]">Difficulty</div>
                </div>
                <div className="bg-white py-5 px-6 rounded-xl border border-[#e0e0e0] text-center min-w-[120px] max-md:flex-1 max-md:min-w-[90px]">
                  <div className="text-2xl font-semibold text-[#333] mb-2">⏱️ {course.workload} hrs</div>
                  <div className="text-[13px] text-[#888]">Weekly Workload</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 pb-20">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="flex gap-0 mb-10 border-b-2 border-[#e0e0e0]">
              <button
                className={`bg-transparent border-none py-4 px-8 text-base font-medium cursor-pointer border-b-[3px] -mb-0.5 transition-all font-inter max-md:py-3 max-md:px-5 max-md:text-sm ${
                  activeTab === 'reviews'
                    ? 'text-[#333] border-b-maceng-maroon'
                    : 'text-[#666] border-b-transparent hover:text-[#333]'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                💬 Reviews ({reviews.length})
              </button>
              <button
                className={`bg-transparent border-none py-4 px-8 text-base font-medium cursor-pointer border-b-[3px] -mb-0.5 transition-all font-inter max-md:py-3 max-md:px-5 max-md:text-sm ${
                  activeTab === 'resources'
                    ? 'text-[#333] border-b-maceng-maroon'
                    : 'text-[#666] border-b-transparent hover:text-[#333]'
                }`}
                onClick={() => setActiveTab('resources')}
              >
                📚 Resources ({resources.length})
              </button>
            </div>

            {activeTab === 'reviews' && (
              <div>
                <div className="flex justify-between items-center mb-[30px] flex-wrap gap-4">
                  <div></div>
                  <button className="bg-[#333] text-white py-2.5 px-6 rounded-md font-medium transition-colors hover:bg-[#555]">Submit Review</button>
                </div>
                {reviewsLoading ? (
                  <div className="text-center py-10 text-[#666]">
                    <div className="text-3xl mb-3">⏳</div>
                    <p>Loading reviews...</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {sortedReviews.map((review: Review) => (
                      <div key={review.id} className="bg-white border border-[#e0e0e0] rounded-xl p-6 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                        <div className="flex justify-between items-start mb-4 flex-wrap gap-3 max-md:flex-col max-md:items-start">
                          <div className="flex gap-4 items-center flex-wrap">
                            <span className="text-lg font-semibold text-[#333]">⭐ {review.rating}/5</span>
                            <span className="text-sm text-[#666]">Difficulty: {review.difficulty}/5</span>
                            <span className="text-sm text-[#666]">Workload: {review.workload} hrs/week</span>
                          </div>
                          <div className="flex flex-col items-end gap-1 max-md:items-start">
                            <span className="font-semibold text-[#333]">{review.professor}</span>
                            <span className="text-sm text-[#888]">{review.term}</span>
                          </div>
                        </div>
                        <p className="text-[#444] leading-[1.7] mb-4 text-[15px]">{review.reviewText}</p>
                        <div className="flex justify-between items-center pt-4 border-t border-[#f0f0f0]">
                          <span className="text-[13px] text-[#999]">{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'resources' && (
              <div>
                <div className="flex justify-between items-center mb-[30px] flex-wrap gap-4 max-md:flex-col max-md:items-stretch">
                  <div className="flex gap-3 max-md:w-full">
                    <select
                      value={resourceFilter}
                      onChange={(e) => setResourceFilter(e.target.value)}
                      className="py-2.5 px-4 border border-[#ddd] rounded-md text-sm font-inter bg-white text-[#666] cursor-pointer transition-colors focus:outline-none focus:border-[#333] max-md:flex-1"
                    >
                      <option value="all">All Types</option>
                      <option value="video">Videos</option>
                      <option value="notes">Notes</option>
                      <option value="practice">Practice</option>
                      <option value="tools">Tools</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'recent' | 'upvotes')}
                      className="py-2.5 px-4 border border-[#ddd] rounded-md text-sm font-inter bg-white text-[#666] cursor-pointer transition-colors focus:outline-none focus:border-[#333] max-md:flex-1"
                    >
                      <option value="upvotes">Most Upvoted</option>
                      <option value="recent">Most Recent</option>
                    </select>
                  </div>
                  <button className="bg-[#333] text-white py-2.5 px-6 rounded-md font-medium transition-colors hover:bg-[#555]">Add Resource</button>
                </div>
                {resourcesLoading ? (
                  <div className="text-center py-10 text-[#666]">
                    <div className="text-3xl mb-3">⏳</div>
                    <p>Loading resources...</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {resources.map((resource: Resource) => (
                      <div key={resource.id} className="bg-white border border-[#e0e0e0] rounded-xl p-5 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
                        <div className="flex gap-5 max-md:gap-3">
                          <div className="flex flex-col items-center gap-1.5">
                            <button className="bg-[#f5f5f5] border border-[#e0e0e0] w-10 h-10 rounded-lg cursor-pointer text-base transition-all flex items-center justify-center hover:bg-maceng-maroon hover:text-white hover:border-maceng-maroon">
                              ▲
                            </button>
                            <span className="font-semibold text-[#666] text-sm">{resource.upvotes}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-[#222] font-inter">{resource.title}</h3>
                              <span className="bg-[#f0f0f0] text-[#666] py-1 px-3 rounded-xl text-xs font-medium capitalize">
                                {resource.resourceType}
                              </span>
                            </div>
                            <p className="text-[#666] leading-relaxed mb-3 text-sm">{resource.description}</p>
                            <div className="flex gap-2 flex-wrap mb-4">
                              {resource.topicTags.map(tag => (
                                <span key={tag} className="bg-[#f8f8f8] text-[#555] py-1 px-2.5 rounded-md text-xs border border-[#e8e8e8]">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-[#f0f0f0]">
                              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-maceng-maroon no-underline font-medium text-sm transition-colors hover:text-[#7d1321]">
                                View Resource →
                              </a>
                              <span className="text-[13px] text-[#999]">
                                {new Date(resource.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
