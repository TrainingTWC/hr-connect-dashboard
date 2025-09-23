
import { Question, Store, AreaManager, HRPerson } from './types';
import { MAPPED_STORES } from './mappedStores';

export const QUESTIONS: Question[] = [
    { id: 'q1', title: 'Is there any work pressure in the café?', type: 'radio', choices: [
      {label: 'Every time', score: 5}, {label: 'Most of the time', score:4}, {label: 'Sometime', score:3}, {label: 'At Time', score:2}, {label: 'Never', score:1}
    ]},
    { id: 'q2', title: 'Are you empowered to make decisions on the spot to help customers and immediately solve their problems/complaints?', type: 'radio', choices: [
      {label: 'Every time', score:5}, {label: 'Most of the time', score:4}, {label: 'Sometime', score:3}, {label: 'At Time', score:2}, {label: 'Never', score:1}
    ]},
    { id: 'q3', title: 'Do you receive regular performance reviews and constructive feedback from your SM / AM ?', type: 'radio', choices: [
      {label: 'Every time', score:5}, {label: 'Most of the time', score:4}, {label: 'Sometime', score:3}, {label: 'At Time', score:2}, {label: 'Never', score:1}
    ]},
    { id: 'q4', title: 'Do you think there is any partiality or unfair treatment within team ?', type: 'radio', choices: [
      {label: 'Excellent', score:5}, {label: 'Very Good', score:4}, {label: 'Good', score:3}, {label: 'Average', score:2}, {label: 'Poor', score:1}
    ]},
    { id: 'q5', title: 'Are you getting the training as per Wings program? What was the last training you got and when ?', type: 'radio', choices: [
      {label: 'Every time', score:5}, {label: 'Most of the time', score:4}, {label: 'Sometime', score:3}, {label: 'At Time', score:2}, {label: 'Never', score:1}
    ]},
    { id: 'q6', title: 'Are you facing any issues with operational Apps ( Zing, Meal benefit, Jify ) or any issues with PF, ESI, Reimbursements,Insurance & Payslips', type: 'radio', choices: [
      {label: 'Every time', score:5}, {label: 'Most of the time', score:4}, {label: 'Sometime', score:3}, {label: 'At Time', score:2}, {label: 'Never', score:1}
    ]},
    { id: 'q7', title: 'Have you gone through the HR Handbook on Zing / Accepted all the policies?', type: 'radio', choices: [
      {label: 'Excellent', score:5}, {label: 'Very Good', score:4}, {label: 'Good', score:3}, {label: 'Average', score:2}, {label: 'Poor', score:1}
    ]},
    { id: 'q8', title: 'Are you satisfied with your current work schedule - Working Hours, Breaks, Timings, Weekly Offs & Comp Offs ?', type: 'radio', choices: [
      {label: 'Every time', score:5}, {label: 'Most of the time', score:4}, {label: 'Sometime', score:3}, {label: 'At Time', score:2}, {label: 'Never', score:1}
    ]},
    { id: 'q9', title: 'How effectively does the team collaborate, and what factors contribute to that?', type: 'radio', choices: [
      {label: 'Excellent', score:5}, {label: 'Very Good', score:4}, {label: 'Good', score:3}, {label: 'Average', score:2}, {label: 'Poor', score:1}
    ]},
    { id: 'q10', title: 'Name one of your colleague who is very helpful on the floor', type: 'input' },
    { id: 'q11', title: 'Any suggestions or support required from the organization ?', type: 'textarea' },
    { id: 'q12', title: 'On a scale of 1 to 5 how do you rate your experience with TWC & why ?', type: 'radio', choices: [
      {label: 'Excellent', score:5}, {label: 'Very Good', score:4}, {label: 'Good', score:3}, {label: 'Average', score:2}, {label: 'Poor', score:1}
    ]}
];

export const AREA_MANAGERS: AreaManager[] = [
      { name: 'Abhishek Vilas Satardekar', id: 'H3386' },
      { name: 'Ajay  Hatimuria', id: 'H546' },
      { name: 'Ajay Omnath Tiwari', id: 'H1815' },
      { name: 'Amar  Debnath', id: 'H535' },
      { name: 'Anil  Rawat', id: 'H2262' },
      { name: 'Gorijala  Umakanth', id: 'H3270' },
      { name: 'Himanshu  Chaudhary', id: 'H955' },
      { name: 'Jagruti Narendra Bhanushali', id: 'H2155' },
      { name: 'Karthick  G', id: 'H3362' },
      { name: 'Kiran Kumar KN', id: 'H2601' },
      { name: 'Shailesh Ramhari Sahu', id: 'H2908' },
      { name: 'Suresh  A', id: 'H1355' },
      { name: 'Vishal Vishwanath Khatakalle', id: 'H3184' },
      { name: 'Vishu  Kumar', id: 'H1766' },
      { name: 'Vruchika Prathamesh Nanavare', id: 'H1575' },
      { name: 'Nandish', id: 'H833' },
      { name: 'Rushikesh  Aade', id: 'H2396' }
];

export const REGIONS = ['North', 'South', 'West'];

// Use the mapped stores from the HR mapping data
export const STORES: Store[] = MAPPED_STORES;

export const HR_PERSONNEL: HRPerson[] = [
    { name: 'HRBP H3578', id: 'H3578' },
    { name: 'HRBP H3500', id: 'H3500' },
    { name: 'HRBP H1746', id: 'H1746' },
    { name: 'Regional HR H2165', id: 'H2165' },
    { name: 'Regional HR H2081', id: 'H2081' },
    { name: 'Regional HR H1648', id: 'H1648' },
    { name: 'HR Head H2082', id: 'H2082' },
    { name: 'LMS Head H541', id: 'H541' }
];
