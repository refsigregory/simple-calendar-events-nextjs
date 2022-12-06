import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useRef, useState } from 'react'

import Head from 'next/head'
import moment from "moment";
import _ from "lodash";
import generateDays from '../utils/generateDaysArray';
import Datepicker from 'react-tailwindcss-datepicker';

const EVENT_TIME_DELAY = 15; // in minutes

type TEvent = {
  id: string,
  name: string,
  color: string,
  days: Array<number>,
};

export default function Home() {
  const [isLoading, setLoading] = useState(false);
  const [eventsList, setEventsList] = useState([]);
  const [calendarDayList, setCalendarDayList] = useState([]);
  const [selectedEventDetails, setSelectedEventDetails] = useState<TEvent>();

  const today = moment().format("YYYYMMDD");
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetail, setShowEventDetailModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(moment().format("MM"));
  const [selectedStartTime, setSelectedStartTime] = useState(moment().format("HH:ss"));
  const [selectedEndTime, setSelectedEndTime] = useState('01:00');

  const [selectedColor, setSelectedColor] = useState('bg-blue-500');
  const [selectedEventDate, setSelectedEventDate] = useState<Number>(0);
  const [selectedEventType, setSelectedEventType] = useState<'day' | 'week'>('day');
  const [currentDatePickerValue, setCurrentDatePickerValue] = useState({ 
    startDate: null,
    endDate: null 
  });

  const eventNameRef = useRef<HTMLInputElement>(null);
  const eventStartDateRef = useRef<HTMLSelectElement>(null);
  const eventStartTimeRef = useRef<HTMLSelectElement>(null);
  const eventEndDateRef = useRef<HTMLSelectElement>(null);
  const eventEndTimeRef = useRef<HTMLSelectElement>(null);

  const getEventsData = () => {
    let controller = new AbortController();
    setLoading(true);

    fetch('/api/events', { signal: controller.signal})
      .then(async (res) => {
        if (res.status === 200) {
          setEventsList(await res.json());
        }
      })
      .finally(() => setLoading(false))
      .catch((err) => {
        if (err.name === "AbortError") {
          console.log("Connection Abort");
        } else {
          alert(err.message);
        }
      });

      return () => {
        controller.abort()
      }
  };

  const getMonday = (date: any) => {
    return moment(date, "YYYYMMDD").startOf("week").day("Monday");
  };

  const addDay = (date: any, day: any) => {
    return moment(date, "YYYYMMDD").add(day, "d");
  };

  const subDay = (date: any, day: any) => {
    return moment(date, "YYYYMMDD").subtract(day, "d");
  };

  const addMonth = (date: any, day: any) => {
    return moment(date, "YYYYMMDD").add(day, "months");
  };

  const subMonth = (date: any, day: any) => {
    return moment(date, "YYYYMMDD").subtract(day, "months");
  };

  const addZero = (num: any) => {
    return num <= 9 ? `0${num}` : `${num}`;
  };

  const getFirstMonday = (date: Number) => {
    return moment(`${moment(moment(date.toString(), "YYYYMMDD")).format("YYYYMM")}01`, "YYYYMM").startOf("week").day("Monday");
  };
  
  const closeModal = () => {
    setShowEventModal(false);
    
    // reset value
    setSelectedColor('bg-blue-500');
  };

  const closeDetailModal = () => {
    setShowEventDetailModal(false);
    
  };

  const handleChangeDate = (date: any) => {
    setCurrentDate(date);
    setCurrentMonth(moment(date).format("MM"));
    getEventsData();
  };

  const handleStartTimeChange = (e: any) => {
    const selectedTime = moment(`${moment(Date.now()).format("YYYYMMDD")}${eventStartTimeRef.current?.value.replace(':', '')}`, "YYYYMMDDHHss")
    const addedTime = selectedTime.add(EVENT_TIME_DELAY, "minutes");
    setSelectedStartTime(eventStartTimeRef.current?.value ? eventStartTimeRef.current?.value  : '00:00');
    setSelectedEndTime(addedTime.format("HH:ss"));
  };

  const handleEndTimeChange = (e: any) => {
    setSelectedEndTime(eventEndTimeRef.current?.value ? eventEndTimeRef.current?.value : '00:00');
  };

  const handleDatepickerValueChange = (newValue: any) => {
    setCurrentDatePickerValue(newValue);
  } 

  const handleUpdateEventType = (e: any) => {
    if (e.target.value) {
      if (selectedEventType === 'day') {
        setSelectedEventType('week');
      } else {
        setSelectedEventType('day');
      }
    }
  };

  const handleOpenModal = (e: any) => {
    setShowEventModal(true);
  }

  const handleOpenAddEvent = (date: Number) => {
    setShowEventModal(true);
    setSelectedEventDate(date);
  }
  
  const handleOpenEvent = (id: string) => {
    fetch('/api/events', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(response => {
      if (response.code === 200) {
        setSelectedEventDetails(response.data.find((obj: TEvent) => {
          return obj.id === id
        }))
      }
    })
      .finally(() => setLoading(false))
      .catch((err) => {
        alert(err.message);
      });

    setShowEventDetailModal(true);
  }

  const handleViewMoreEvents = (date: number) => {
    console.log(date);
    // TODO: showing all data in this calendar
  };

  const handleAddEvent = () => {
    setShowEventModal(false);
    const formData = {
      eventName: eventNameRef.current?.value,
      startTime: selectedEventType === 'day' ? eventStartTimeRef.current?.value : '0000',
      endTime: selectedEventType === 'day' ? eventEndTimeRef.current?.value : '0000',
      startDate: selectedEventType === 'day' ? selectedEventDate : moment(currentDatePickerValue.startDate, "YYYY-M-D").format("YYYYMMDD"),
      endDate: selectedEventType === 'day' ? selectedEventDate : moment(currentDatePickerValue.endDate, "YYYY-M-D").format("YYYYMMDD"),
    }
    let days = generateDays(parseInt(`${formData.startDate}${formData.startTime?.replace(":", "")}`), parseInt(`${formData.endDate}${formData.endTime?.replace(":", "")}`))
    
    if (formData.eventName && formData.startTime) {
      fetch('/api/events/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "name": formData.eventName,
          "color": selectedColor,
          "days": days
        } ),
      })
        .then(async (res) => {
          if (res.status === 200) {
            getEventsData();
          }
        })
        .finally(() => setLoading(false))
        .catch((err) => {
          alert(err.message);
        });
  
    } else {
      alert("Please provide valid data!")
    }
    closeModal();
  };


  const handleDeleteEvent = (id: any) => {
    console.log(id)
    fetch('/api/events/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "id": id,
      } ),
    })
      .then(async (res) => {
        if (res.status === 200) {
          getEventsData();
        }
      })
      .finally(() => setLoading(false))
      .catch((err) => {
        alert(err.message);
      });

      closeDetailModal();
  };

  type TCalendarColumn = {
    col: Number,
  }
  const CalendarColumn = (props: TCalendarColumn) => {
    const firstDay = getFirstMonday(parseInt(`2022${currentMonth}01`)).format("YYYYMMDD");
    let day = addDay(firstDay, parseInt(props.col)-1);
    let events: Array<Object> = eventsList.data ? eventsList.data : [];

    let eventItems: any = []

    for (let hour = 0; hour <= 24; hour++) {
      for (let minute = 0; minute <= 60; minute++) {
        if (minute % EVENT_TIME_DELAY === 0) {
          if (events.length > 0) {
              let current = Number(parseInt(`${day.format("YYYYMMDD")}${addZero(hour)}${addZero(minute)}`));
              events.map((timeline) => {
                if (timeline.days) {
                  if (timeline.days.includes(current)) {
                    eventItems.push(<div key={`${timeline.id}${current}`} onClick={() => handleOpenEvent(timeline.id)} className={`w-full ${ timeline.days.includes(current) ? `${timeline.color} text-white py-1 my-1` : ''}`}>{timeline.name}</div>)
                  }
                }
              })
            }
        }
      }
    }
    
    return <Fragment key={parseInt(props.col)}>
    <td key={props.col.toString()} style={{height: '150px'}} className={day.format("MM") === currentMonth ? "bg-white text-center text-xs font-medium text-gray-500 tracking-wider border border-1" : "bg-gray-100 text-center text-xs font-medium text-gray-500 tracking-wider border border-1"}>
    {
        day.format("MM") === currentMonth ? 
          <div className='w-full h-full'>
            <div className='pb-1'>
              {day.format("D")}
            </div>
            {
              eventItems.length <= 3 ?
                <>
                  {
                    eventItems.map((item) => {
                      return item
                    })
                  }
                  <div className="w-full text-white">
                    <div
                      className={`w-full hover:bg-blue-500 hover:text-white py-1 my-1 rounded`}
                      onClick={() => handleOpenAddEvent(parseInt(day.format("YYYYMMDD")))}
                    >(No title)</div>
                  </div>
                </>
                :
                <>
                  {
                    [...Array(3)].map((x,idx) => {
                      return eventItems[idx]
                    })
                  }
                  <div
                    onClick={() => handleViewMoreEvents(parseInt(day.format("YYYYMMDD")))}
                    className="w-full text-gray py-1 my-1 hover:bg-gray-100">{eventItems.length} more</div>
                </>
            }
          </div>
          :
          <div className='w-full h-full'>
            <div className='pb-1'>
              {day.format("D")}
            </div>
          </div>
      }
      </td>
    </Fragment>
  }

  const LoadingComponent = () => {
    return <div className="w-full flex justify-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx={12} cy={12} r={10} stroke="currentColor" strokeWidth={4} />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>;
  }

  useEffect(() => {
    getEventsData();
  }, [])
  
  useEffect(() => {
    let lastWeek = 0;
    let weekList: any[] = [[]];
    [...Array(42)].forEach((x, col) => {
      // add new week every 7 days
      if ((col) % 7 == 0) {
        // add array for new week
        weekList.push([])
      }
      let newComponent = <CalendarColumn key={col} col={col} />;
      // adding data to last week availavle
      weekList[weekList.length - 1].push(newComponent)
    });
    setCalendarDayList(weekList);
  }, [ eventsList ]);

  return (
    <>
      <Head>
        <title>Calendar</title>
        <meta name="description" content="Calendar by Ref.si" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex px-6 py-3 text-center text-xs font-medium text-gray-700 tracking-wider">  
        <button
            type="button"
            className="cursor-pointer px-4 border hover:bg-gray-100 rounded"
            onClick={() => handleChangeDate(moment().format("YYYYMMDD"))}
          >
          Today
        </button>

        <button
          type="button"
          className="ml-2 cursor-pointer leading-none rounded-lg transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-gray-200 p-1 items-center"
          onClick={() => handleChangeDate(subMonth(currentDate, 1))}
          >
          <svg
            className="h-6 w-6 text-gray-500 inline-flex leading-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          type="button"
          className="mr-2 cursor-pointer leading-none rounded-lg transition ease-in-out duration-100 inline-flex items-center cursor-pointer hover:bg-gray-200 p-1"
          onClick={() => handleChangeDate(addMonth(currentDate, 1))}
         >
          <svg
            className="h-6 w-6 text-gray-500 inline-flex leading-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <div className='px-4 py-3 text-lg uppercase'>
        {getMonday(currentDate).format("MMMM YYYY")}
        </div>
      </div>
      {
        isLoading ?
          <LoadingComponent />
          :
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50 text-xs">
            <tr>
              {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((x, i) => (
                <Fragment key={i}>
                  <th
                  key={i}
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                  {x}
                  </th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {
              !isLoading &&
                calendarDayList.map((obj, key) => {
                  return <Fragment key={key}>
                    <tr>{obj}</tr>
                  </Fragment>;
                })
            }
          </tbody>
        </table>     
      }
     
      
      <Transition appear show={showEventModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => closeModal()}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {/* <form onSubmit={handleAddEvent}> */}
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Add Events
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className='w-full py-2'>
                      <input ref={eventNameRef} type="text" className='w-full' placeholder="Add title here" />
                    </div>
                    {
                      selectedEventType === 'day' ? 
                        <div className='w-full py-2 flex flex-row'>
                          <div className='text-gray-800 text-sm'>{moment(selectedEventDate, "YYYYMMDD").format("dddd, D MMMM YYYY")}</div> 
                          <select
                            key={1}
                            ref={eventStartTimeRef}
                            onChange={(e) => handleStartTimeChange(e)}
                            value={selectedStartTime}
                            className='py-1 mx-2 w-20 bg-gray-100'
                            >
                            {[...Array(24)].map((x, h) => (
                              <Fragment key={h}>
                              {[...Array(60)].map((y, m) => (
                                m % EVENT_TIME_DELAY === 0 &&
                                <option key={`${h}${m}`}>{addZero(h)}:{addZero(m)}</option>
                              ))}
                              </Fragment>
                            ))}
                          </select>  –
                          <select
                            key={2}
                            ref={eventEndTimeRef}
                            onChange={(e) => handleEndTimeChange(e)}
                            value={selectedEndTime}
                            className='py-1 mx-2 w-20 bg-gray-100'
                            >
                            {[...Array(24)].map((x, h) => (
                              <Fragment key={h}>
                              {[...Array(60)].map((y, m) => (
                                m % EVENT_TIME_DELAY === 0 &&
                                  <option key={parseInt(`${h}${m}`)}>{addZero(h)}:{addZero(m)}</option>
                              ))}
                              </Fragment>
                            ))}
                          </select>
                        </div>
                      :
                      <div className='w-full py-2 flex flex-row'>
                        <Datepicker
                          separator={"–"} 
                          value={currentDatePickerValue}
                          onChange={(e) => handleDatepickerValueChange(e)}
                        />
                      </div>
                    }
                    <div className='w-full py-2'>
                      <div className="flex flex-col">
                        <label className="inline-flex items-center">
                          <input onChange={(e) => handleUpdateEventType(e)} type="checkbox" className="form-checkbox h-5 w-5 text-gray-600" /><span className="ml-2 text-gray-700">All Day</span>
                        </label>
                      </div>
                    </div>
                    <div className='w-full py-2 flex flex-row'>
                      <div className='text-gray-800 text-sm'>Color: </div>
                      <select
                        key={3}
                        className={`rounded mx-2 py-1 w-20 text-white ${selectedColor !== '' ? `${selectedColor}` : 'text-black'}`}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        >
                        <option key={1} value="bg-blue-500">blue</option>
                        <option key={2} value="bg-green-500">green</option>
                        <option key={3} value="bg-red-500">red</option>
                        <option key={4} value="bg-purple-500">purple</option>
                        <option key={5} value="bg-orange-500">orange</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => handleAddEvent()}
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      Save
                    </button>
                  </div>
                  {/* </form> */}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={showEventDetail} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => closeDetailModal()}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Detail Events
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className='w-full py-2'>
                      <div className="text-black">{selectedEventDetails?.name}</div>
                    </div>
                    <div className='w-full py-2 flex flex-row'>
                      {
                        selectedEventDetails?.days &&
                        selectedEventDetails?.days > 0 ?
                          selectedEventDetails?.days > 1 ?
                              <>
                                {
                                  selectedEventDetails?.days.map((obj, key) => {
                                    return <div key={key} className='text-gray-800 text-sm'>{moment(obj, "YYYYMMDDHHss").format("dddd, D MMMM YYYY HH:ss")}</div>
                                  })
                                }
                              </>
                                :
                              <>
                                {
                                  selectedEventDetails?.days && selectedEventDetails?.days.length > 0 ?
                                      selectedEventDate?.days &&
                                        <div className="text-gray-800 text-sm">{moment(selectedEventDate?.days[0], "YYYYMMDDHHss").format("dddd, D MMMM YYYY HH:ss")}</div>
                                    :
                                    ''
                                }
                              </>
                        :
                        <>
                          { 
                            selectedEventDetails?.days &&
                              <>
                                <div className="text-gray-800 text-sm">{moment(selectedEventDetails?.days[0], "YYYYMMDDHHss").format("dddd, D MMMM YYYY HH:ss")}</div>
                                {
                                  selectedEventDetails?.days.length > 1 &&
                                    <>
                                      <div className="mr-6">–</div><div className="text-gray-800 text-sm">{moment(selectedEventDetails?.days[selectedEventDetails?.days.length - 1], "YYYYMMDDHHss").format("dddd, D MMMM YYYY HH:ss")}</div>
                                    </>
                                }
                              </>
                          }
                        </>
                      }
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                    onClick={() => handleDeleteEvent(selectedEventDetails?.id)}
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    >
                      Delete
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
