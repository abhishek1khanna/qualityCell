import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [limit, setLimit] = useState("1");
  return (
    <AppContext.Provider
      value={{
        limit,
        setLimit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useUserContext = () => useContext(AppContext);
