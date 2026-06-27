import React, { useState } from 'react'
import Popup from './Popup/Popup'
import Settings from './Popup/settings'
const App = () => {
  const [page, setpage] = useState("home")
  return (
    <div>
      {page === "home" && (
        <Popup setPage = {setpage} />
      )}

      {page === "settings" && (
        <Settings setPage = {setpage}  />
      )}
    </div>
  )
}

export default App