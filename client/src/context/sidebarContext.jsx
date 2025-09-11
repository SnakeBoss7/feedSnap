import { createContext,useContext } from "react";
import { useState } from "react";
const sidebarContext = createContext(
    {
        showSidebar: false,
        sidebarSize: false,
        setSidebarSize:()=>{},
        setShowSidebar: () => {},
    }
);

const SidebarContextprovider = ({children})=>
    {
    const [showSidebar, setShowSidebar] = useState(false);
    const [sidebarSize, setSidebarSize] = useState(false);
        return (
            <sidebarContext.Provider value={{showSidebar,setShowSidebar,sidebarSize,setSidebarSize}}>
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