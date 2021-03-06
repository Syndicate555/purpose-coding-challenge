import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './style.css';
const Form = () => {
 const [fundData, setFundData] = useState([]);
 const [formData, setFormData] = useState([]);
 const [date, setDate] = useState('');
 const [error, setError] = useState([]);
 const [loadingData, setLoadingData] = useState(true);
 const [submitingData, setSubmitingData] = useState(false);
 const [emptyDashboard, setEmptyDashbord] = useState(true);
 useEffect(() => {
  if (loadingData) {
   getData();
  }
 }, []);

 // useEffect(() => {
 //  if (submitingData) {
 //   submitData(formData);
 //  }
 // }, [submitingData]);

 const handleInputData = () => {};

 const handleDateInput = useCallback((e) => setDate(e.target.value), []);
 const getData = async () => {
  try {
   const response = await axios.get('http://localhost:4545');
   if (!response && !response.data) {
    throw new Error('No response from server');
   }
   setFundData(response.data);
   setEmptyDashbord(false);
   setError(null);
  } catch (error) {
   console.error(error);
   setError(error.message);
  }
  return setLoadingData(false);
 };

 const submitData = async (data) => {
  try {
  } catch (error) {
   console.error(error);
   setError(error);
  }
  return setSubmitingData(false);
 };
 const getSeriesData = (series) => {
  let content = [];
  for (const seriesId in series) {
   content.push(
    <div className='series'>
     <br />
     <p>Series ID: {seriesId}</p>
     <input className='form-control' placeholder='Enter updated aum' required type='number' />
    </div>
   );
  }
  return content;
 };
 console.log(date);
 return (
  <div className='container'>
   {error && error.length > 0 ? (
    <div className='card' style={{ marginTop: '2rem', padding: '1rem' }}>
     <h2>Something went wrong, please try again</h2>
    </div>
   ) : (
    <>
     <div className='card' style={{ marginTop: '2rem', padding: '1rem' }}>
      <h1>Updating Fund data</h1>
      <p>
       Below is an auto generated list of all the purpose funds that are outdated. This tool allows the user to update
       the date and the AUM values of each respective fund. Click the submit button to update the funds with the new
       values
      </p>
     </div>
     <form action=''>
      <br />
      <br />
      <div className='card' id='card' hidden={emptyDashboard}>
       Enter new date:
       <br />
       <input className='form-control' required type='date' onChange={handleDateInput} />
      </div>
      {fundData.length > 0 ? (
       fundData.map((item) => {
        return (
         <div key={item.fund_id} className='card' id='card'>
          <h2>
           Fund Name: {item.name.en}({item.fund_id})
          </h2>
          <p>Current Fund AUM: ${item.aum}</p>
          <p>Updated Fund AUM:</p>
          <input className='form-control' placeholder='Enter updated aum' required type='number' />
          {getSeriesData(item.series)}
          <br />
          <br />
         </div>
        );
       })
      ) : (
       <div class='d-flex justify-content-center'>
        <div class='spinner-border text-light' role='status'></div>
       </div>
      )}
      <button hidden={emptyDashboard} type='button' class='btn btn-primary'>
       Submit Data
      </button>
      <br />
      <br />
     </form>
    </>
   )}
  </div>
 );
};

export default Form;
