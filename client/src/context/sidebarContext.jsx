import { createContext,useContext } from "react";
import { useState } from "react";
const sidebarContext = createContext(
    {
        showSidebar: false,
        setShowSidebar: () => {},
    }
);

const SidebarContextprovider = ({children})=>
    {
        const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 1024);
        return (
            <sidebarContext.Provider value={{showSidebar,setShowSidebar}}>
                {children}
            </sidebarContext.Provider>
        )
    }

const useSidebarContext = () =>
    {
        let context =  useContext(sidebarContext);
        if(!context)
            {
                throw new Error ('using context outside the provider');

            }
            return context;
    };
export {useSidebarContext,SidebarContextprovider}