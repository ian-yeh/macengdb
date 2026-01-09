import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCourses } from '../api';
import { type Course } from '../mockData';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const navigate = useNavigate();

  const departments = ['All', 'Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Engineering', 'Mathematics'];

  const { data: courses = [], isLoading, error } = useQuery({
    queryKey: ['courses', searchQuery, selectedDepartment],
    queryFn: () => fetchCourses(searchQuery, selectedDepartment),
  });

  const handleCourseClick = (courseId: number) => {
    navigate(`/course/${courseId}`);
  };

  console.log(courses);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main>
        <section className="py-20 text-center">
          <div className="max-w-[1200px] mx-auto px-5">
            <h1 className="text-[56px] mb-5 text-[#222] font-playfair font-semibold max-md:text-4xl">Course Reviews & Resources</h1>
            <p className="text-xl text-[#666] mb-10 max-w-[600px] mx-auto">
              Find what McMaster Engineering students actually think about courses, plus the study resources that helped them succeed.
            </p>
            <div className="max-w-[600px] mx-auto mb-[60px] relative">
              <input
                type="text"
                placeholder="Search courses (e.g., COMPSCI 2C03, Data Structures...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-4 px-5 text-base border-2 border-[#ddd] rounded-lg font-inter bg-white transition-colors focus:outline-none focus:border-[#333]"
              />
            </div>
          </div>
        </section>

        <section className="py-10 pb-20">
          <div className="max-w-[1200px] mx-auto px-5">
            <div className="flex justify-between items-center mb-[30px] flex-wrap gap-5">
              <h2 className="text-4xl text-[#222] font-playfair">Popular Courses</h2>
              <div className="flex gap-2.5 flex-wrap">
                {departments.map(dept => (
                  <button
                    key={dept}
                    className={`py-2 px-4 border rounded-md font-inter text-sm cursor-pointer transition-all ${selectedDepartment === dept
                        ? 'border-[#333] bg-[#333] text-white'
                        : 'border-[#ddd] bg-white text-[#666] hover:border-[#333] hover:bg-[#333] hover:text-white'
                      }`}
                    onClick={() => setSelectedDepartment(dept)}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {isLoading && (
              <div className="text-center py-20 text-[#666]">
                <div className="text-4xl mb-4">⏳</div>
                <p>Loading courses...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-20 text-red-600">
                <div className="text-4xl mb-4">⚠️</div>
                <p>Failed to load courses. Please make sure the backend is running.</p>
              </div>
            )}

            <div className="grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] gap-6 max-md:grid-cols-1">
              {courses.map((course: Course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl p-6 border border-[#e0e0e0] transition-all cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <div className="font-inter font-semibold text-sm text-[#999] mb-2">{course.code}</div>
                  <h3 className="font-playfair text-[22px] font-semibold mb-3 text-[#222]">{course.title}</h3>
                  <div className="flex gap-5 mb-4 text-sm flex-wrap">
                    <div className="flex items-center gap-1.5 text-[#666]">
                      <span>⭐</span>
                      <span className="text-[#333] font-semibold">{course.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#666]">
                      <span>📊</span>
                      <span>Difficulty: {course.difficulty.toFixed(1)}/5</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#666]">
                      <span>⏱️</span>
                      <span>~{course.workload} hrs/week</span>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-[#f0f0f0] text-[13px] text-[#888]">
                    <span className="flex items-center gap-1">💬 {course.reviewCount} reviews</span>
                    <span className="flex items-center gap-1">📚 {course.resourceCount} resources</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
