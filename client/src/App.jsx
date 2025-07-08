import logo from './logo.svg';
import './App.css';

function App() {

  return (
    <div className="App ">
      <form className='flex flex-col gap-3 '>
        <input type="text" placeholder="Enter your name" />
        <input type="text" placeholder="Enter your email" />
        <input type='password' placeholder='Enter your password'/>
        <button type='submit'>Submit</button>
      </form>
    </div>
  );
}

export default App;
