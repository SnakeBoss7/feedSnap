import React from 'react';
import styled from 'styled-components';

const AddButton = ({onCreateTeam}) => {
  return (
    <StyledWrapper>
      <button onClick={onCreateTeam} className="button">
        Create Team
        <div className="hoverEffect">
          <div />
        </div>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15px 30px;
    border: 0;
    position: relative;
    overflow: hidden;
    border-radius: 10rem;
    transition: all 0.02s;
    font-weight: bold;
    cursor: pointer;
    color: white;
    z-index: 0;
    box-shadow: 0 0px 7px -5px rgba(0, 0, 0, 0.5);
  }

  .button:hover {
    background: rgba(95, 201, 69, 0.61);
    color: rgb(33, 0, 85);
  }

  .button:active {
    transform: scale(0.97);
  }

  .hoverEffect {
    position: absolute;
    bottom: 0;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  .hoverEffect div {
    background: rgba(65, 146, 223, 1);
    background: linear-gradient(
      90deg,
      rgba(24, 92, 11, 1) 0%,
      rgba(140, 226, 28, 0.62) 49%,
      rgba(8, 71, 27, 1) 100%
    );
    border-radius: 40rem;
    width: 10rem;
    height: 10rem;
    transition: 0.4s;
    filter: blur(20px);
    animation: effect infinite 3s linear;
    opacity: 0.5;
  }

  .button:hover .hoverEffect div {
    width: 8rem;
    height: 8rem;
  }

  @keyframes effect {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }`;

export default AddButton;
