import React from "react";

import queryString from "query-string";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";

interface StoredQspProviderProps {
  children: React.ReactNode | React.ReactNode[] | React.ReactElement | React.ReactElement[];
}
function StoredQspProvider({ children }: StoredQspProviderProps) {
  return (
    <QueryParamProvider
      adapter={ReactRouter6Adapter}
      options={{
        searchStringToObject: queryString.parse,
        objectToSearchString: queryString.stringify,
        updateType: "replaceIn",
      }}
    >
      {children}
    </QueryParamProvider>
  );
}

export default StoredQspProvider;
