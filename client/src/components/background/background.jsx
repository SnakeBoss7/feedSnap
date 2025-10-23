export const Background = ({ color  }) => {
  const gradientStyles = {
    mobile: {
      background: `radial-gradient(circle 700px at 50% 200px, ${color}, transparent)`
    },
    desktop: {
      background: `radial-gradient(circle 1800px at 0% 000px, ${color}, transparent)`
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 -z-10 pointer-events-none lg:hidden"
        style={gradientStyles.mobile}
      >
      </div>
      <div 
        className="fixed inset-0 -z-10 pointer-events-none hidden lg:block"
        style={gradientStyles.desktop}
      >
      </div>
      <div className="fixed inset-0 -z-20 h-full w-full bg-white bg-[linear-gradient(to_right,#e8e8e8_1px,transparent_2px),linear-gradient(to_bottom,#e8e8e8_0.5px,transparent_2px)] bg-[size:4.5rem_3.5rem]">
      </div>
    </>
  );
};