import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="card bg-transparent">
        <div className="loader">
          <p className="text-white">loading</p>
          <div className="words text-primary2">
            <span className="word">Widget</span>
            <span className="word">Code</span>
            <span className="word">Script</span>
            <span className="word">Widget</span> {/* Duplicate first word for smooth loop */}
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    background-color: var(--bg-color);
    padding: 1rem 2rem;
    border-radius: 1.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .loader {

    font-family: "Poppins", sans-serif;
    font-weight: 500;
    font-size: 25px;
    box-sizing: content-box;
    height: 40px;
    padding: 10px;
    display: flex;
    align-items: center;
    border-radius: 8px;
  }

  .words {
    overflow: hidden;
    position: relative;
    height: 40px;
    margin-left: 8px;
  }
  
  .words::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      var(--bg-color) 10%,
      transparent 30%,
      transparent 70%,
      var(--bg-color) 90%
    );
    z-index: 20;
    pointer-events: none;
  }

  .word {
    display: block;
    height: 40px;
    line-height: 40px;

    animation: spin_words 3s infinite;
  }

  @keyframes spin_words {
    0% {
      transform: translateY(0%);
    }
    
    33% {
      transform: translateY(-100%);
    }
    
    66% {
      transform: translateY(-200%);
    }
    100% {
      transform: translateY(-300%);
    }
    

  }
`;

export default Loader;