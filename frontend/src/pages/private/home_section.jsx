<>
  <nav
    className={`bg-gray-600 sm:w-72 w-56 ${
      menuVisible
        ? window.innerHeight >= window.innerWidth
          ? "block absolute z-50 top-0 left-0 h-full"
          : "block h-full"
        : "hidden"
    }`}
    ref={sidebarRef}
  >
    {/* <Sidebar
            SidebarData={SidebarData}
            currName={currentOfficer.name}
            setActivePage={setActivePage}
            setActivePageName={setActivePageName}
          /> */}
  </nav>
  <div className="flex-1 flex-wrap bg-slate-50" ref={contentRef}>
    <div className="flex flex-col h-full">
      <TopNavbar
        onClick={toggleMenu}
        appname={"QualityCell Portal"}
        pagename={activePageName}
        show={true}
      />
      <div className="flex-1 items-center justify-center py-2 px-2 h-full w-full bg-gradient-to-r from-slate-100 via-purple-50 to-blue-50 ">
        {/* <HomeRoutes
                selectedMenu={activePage}
                setActivePage={setActivePage}
                setActivePageName={setActivePageName}
              /> */}
      </div>
    </div>
  </div>
  {/* Overlay */}
  {menuVisible && window.innerHeight >= window.innerWidth && (
    <div
      className={`fixed z-40 inset-0 bg-gray-900 bg-opacity-50 `}
      onClick={toggleMenu}
    ></div>
  )}
</>;
