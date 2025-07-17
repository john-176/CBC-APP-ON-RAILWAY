import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { timetableAPI, currentUserChecker } from '../../api';
import DigitalClock from './DigitalClock';
import './Timetable.css';

const categories = [
  {
    name: 'Junior Secondary',
    key: 'junior-secondary',
    grades: ['7', '8', '9'],
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    periods: [
      "8:00-8:40 AM", "8:40-9:20 AM", "9:20-9:50 AM", "9:50-10:30 AM",
      "10:30-11:10 AM", "11:10-11:20 PM", "11:20-12:00 PM", "12:00-12:40 PM",
      "12:40-1:30 PM", "1:30-2:10 PM", "2:10-2:50 PM", "2:50-3:30 PM", "3:30-4:10 PM",
    ],
  },

  {
    name: 'Upper Primary',
    key: 'upper-primary',
    grades: ['4', '5', '6'],
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    periods: [
      "8:20-8:55 AM", "8:55-9:30 AM", "9:30-10:00 AM", "10:00-10:35 AM",
      "10:35-11:10 AM", "11:10-11:30 AM", "11:30-12:05 PM", "12:05-12:40 PM",
      "12:40-2:00 PM", "2:00-2:35 PM", "2:35-3:10 PM", "3:10-4:00 PM"
    ],
  },


  //The lower primary table can be brought back by uncommenting below code block.
  //However note that the grades timelines are unique and therefore they will need unique timeliness of their own.
  
  {
    name: 'Lower Primary 1 & 2',
    key: 'lower-primary',
    grades: ['1', '2'],
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    periods: [
      "8:20-8:55 AM", "8:55-9:30 AM", "9:30-10:00 AM", "10:00-10:35 AM",
      "10:35-11:10 AM", "11:10-11:30 AM", "11:30-12:05 PM", "12:05-12:40 PM",
      "12:40-2:00 PM",
    ],
  },  

    {
    name: 'Lower Primary 3',
    key: 'lower-primary3',
    grades: ['3'],
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    periods: [
      "8:20-8:55 AM", "8:55-9:30 AM", "9:30-10:00 AM", "10:00-10:35 AM",
      "10:35-11:10 AM", "11:10-11:30 AM", "11:30-12:05 PM", "12:05-12:40 PM",
      "12:40-2:00 PM",
    ],
  },  
];




const subjects = [
  'jss', 'MATH', 'ENG', 'KISW', 'BREAK 1', 'C/A', 'CRE', 'BREAK 2',
  'PRE/TECH', 'S/S', 'LUNCH', 'AGR/NUT', 'INT/SCI', 'LIB', 'PPI', 'GAMES',
  'upper pri', 'S/T', 'KSL', 'COMP',
  'lower pri', 'MOVEMENT', 'ENV & HYG', 'M/T-KISW', 'ENVIROMENT', 'C/MUSIC', 'KISW/MT', 'A/N',
];

const parseTime = (timeStr) => {
  const [startRaw, endRaw] = timeStr.split('-');
  
  const parsePart = (part) => {
    const [time, meridiem] = part.trim().split(' ');
    const [h, m] = time.split(':').map(Number);
    let hour = h;

    if (meridiem === 'PM' && h !== 12) hour += 12;
    if (meridiem === 'AM' && h === 12) hour = 0;

    return { hour, minute: m };
  };

  const { hour: startH, minute: startM } = parsePart(startRaw);
  const { hour: endH, minute: endM } = parsePart(endRaw);

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH, startM, 0).getTime();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, endM, 0).getTime();

  return { start, end };
};


const getCurrentPeriod = (periods, now) => {
  const currentTime = now.getTime();
  for (let period of periods) {
    const { start, end } = parseTime(period);
    if (currentTime >= start && currentTime <= end) return period;
  }
  return null;
};

const TimetableCell = React.memo(
  ({ entry, editMode, subjects, teacherNumbers, onChangeSubject, onChangeTeacher, isCurrentSession }) => (
    <td className={isCurrentSession ? 'current-session' : ''} rowSpan={entry.rowSpan || 1}>
      {editMode ? (
        <div className="dropdowns">
          <select value={entry.subject} onChange={onChangeSubject}>
            <option value="">Subject --</option>
            {subjects?.map((subj) => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>
          <select value={entry.teacher} onChange={onChangeTeacher}>
            <option value="none">No. --</option>
            {teacherNumbers?.map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <strong>{entry.subject}</strong><br />
          {entry.teacher && `#${entry.teacher}`}
        </div>
      )}
    </td>
  )
);

const Timetable = () => {
  const teacherNumbers = useMemo(() => Array.from({ length: 20 }, (_, i) => i + 1), []);
  const [timetables, setTimetables] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isStaff, setIsStaff] = useState(false);
  const [showEditDeniedMsg, setShowEditDeniedMsg] = useState(false);

  const currentPeriod = useMemo(() => getCurrentPeriod(categories[0].periods, currentTime), [currentTime]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await currentUserChecker.getCurrentUser();
        setIsStaff(response.data.is_staff || response.data.is_superuser);
      } catch (err) {
        setIsStaff(false); // Default to false if not logged in
      }
    };
    fetchUser();
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentWeekday = useMemo(() => currentTime.toLocaleDateString('en-US', { weekday: 'long' }), [currentTime]);

  useEffect(() => {
    const fetchAll = async () => {
        const allData = {};
        await Promise.all(categories.map(async (cat) => {
            try {
                const response = await timetableAPI.getTimetable(cat.key);
                allData[cat.key] = response.data;
            } catch (err) {
                console.error(`Failed to load data timetable for ${cat.key}`, err);
            }
        }));
        setTimetables(allData);
    };
    fetchAll();
    }, []);


  const handleChange = useCallback((category, day, grade, period, field, value) => {
    setTimetables(prev => {
      const updated = { ...prev };
      if (!updated[category]) updated[category] = {};
      if (!updated[category][day]) updated[category][day] = {};
      if (!updated[category][day][grade]) updated[category][day][grade] = {};
      if (!updated[category][day][grade][period]) {
        updated[category][day][grade][period] = { subject: '', teacher: '' };
      }
      updated[category][day][grade][period][field] = value;
      return updated;
    });
  }, []);

    const handleSave = async () => {
        try {
            await Promise.all(categories.map(cat =>
            timetableAPI.updateTimetable(cat.key, timetables[cat.key])
        ));
        setEditMode(false);
        alert('Saved!');
        } catch (err) {
            console.error("Failed to save timetable:", err);
            alert("Failed to save. Try again.");
        }
    };


  const handlePrint = (sectionId) => {
    const printContent = document.getElementById(sectionId);
    const WinPrint = window.open('', '', 'width=900,height=650');
    WinPrint.document.write(`
      <html>
        <head>
          <title>Print Timetable</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; }
            .day-block td { background: #eee; font-weight: bold; }
            .current-session { background: #ffc; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  return (
    <div className="timetable-container">
      <div className="">
        <div className="timetable-header">
            <h1>BY FAITH & HOPE ACADEMY</h1>
          <div className="home-button">
            <Link to="/">
              <button>🏠 Home</button>
            </Link>
          </div>
        </div>

        <hr />
        <h2>Full Timetable</h2>
        <div className="action-buttons no-print">

        <div className="edit-btn-wrapper">
          {showEditDeniedMsg && (
            <div className="edit-info-message">
              You're not allowed to edit the timetable.
            </div>
          )}

          <button
            onClick={() => {
              if (isStaff) {
                setEditMode(!editMode);
              } else {
                setShowEditDeniedMsg(true);
                setTimeout(() => setShowEditDeniedMsg(false), 2000);
              }
            }}
            className={!isStaff ? 'disabled-btn' : ''}
            >
            {editMode ? '✖ Cancel' : '🖉 Edit Timetable'}
          </button>
        </div>

          {isStaff && editMode && (
            <button onClick={handleSave}>💾 Save Changes</button>
          )}


        </div>

        <div className="clock-div"><DigitalClock /></div>
      </div>

      {categories.map(({ name, key, grades, days, periods }) => {
        const currentPeriod = getCurrentPeriod(periods, currentTime);

        return (
          <div className="section-block" id={`print-${key}`} key={key}>
            <h4>{name}</h4>
            <button onClick={() => handlePrint(`print-${key}`)} className="print-btn">
              🖨️ Print {name}
            </button>

            <div>
              <table className={`timetable ${editMode ? 'edit-mode' : ''}`} style={{ '--column-count': periods.length }}>
                <thead>
                  <tr>
                    <th className="diagonal-header">
                      <div className="diagonal-label top-left">TIME</div>
                      <div className="diagonal-label bottom-right">GRADE</div>
                    </th>
                    {periods.map((p) => <th key={p}>{p}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <React.Fragment key={day}>
                      <tr className="day-block">
                        <td colSpan={periods.length + 1}>{day}</td>
                      </tr>
                      {grades.map((grade, gradeIndex) => (
                        <tr key={`${day}-${grade}`}>
                          <td>Grade {grade}</td>
                          {periods.map((period, pIndex) => {
                            const entry = timetables[key]?.[day]?.[grade]?.[period] || { subject: '', teacher: '' };
                            const isCurrentDay = day === currentWeekday;
                            const isCurrentSession = isCurrentDay && period === currentPeriod;

                            // Only render cell if it's not already merged vertically
                            if (
                              gradeIndex > 0 &&
                              timetables[key]?.[day]?.[grades[gradeIndex - 1]]?.[period]?.subject === entry.subject &&
                              ['BREAK 1', 'BREAK 2', 'LUNCH', 'GAMES', 'PPI'].includes(entry.subject)
                            ) {
                              return null;
                            }

                            let rowSpan = 1;
                            if (['BREAK 1', 'BREAK 2', 'LUNCH', 'GAMES', 'PPI'].includes(entry.subject)) {
                              for (let i = gradeIndex + 1; i < grades.length; i++) {
                                const nextEntry = timetables[key]?.[day]?.[grades[i]]?.[period];
                                if (nextEntry && nextEntry.subject === entry.subject) {
                                  rowSpan++;
                                } else {
                                  break;
                                }
                              }
                            }

                            return (
                              <TimetableCell
                                key={`${day}-${grade}-${period}`}
                                entry={{ ...entry, rowSpan }}
                                editMode={editMode}
                                subjects={subjects}
                                teacherNumbers={teacherNumbers}
                                onChangeSubject={(e) => handleChange(key, day, grade, period, 'subject', e.target.value)}
                                onChangeTeacher={(e) => handleChange(key, day, grade, period, 'teacher', e.target.value)}
                                isCurrentSession={isCurrentSession}
                              />
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timetable;