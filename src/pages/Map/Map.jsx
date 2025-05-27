import "./map.scss";
import { useState } from "react";
import NearbyUsers from "../../components/NearByUser/NearByUser";
import MapView from "../../components/MapView/MapView";
import EventsList from "../../components/CreateEvents/EventLists";

const MapPage = () => {
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="content" id="home-page">
      <div className="content-main">
        <MapView refresh={refresh} setRefresh={setRefresh} />
      </div>
      <div className="content-side">
        <>
          <section className="side-content-box">
            <NearbyUsers />
          </section>
          <section className="side-content-box">
            <p>Nearby Events</p>
            <EventsList refresh={refresh} setRefresh={setRefresh} />
          </section>
        </>
      </div>
    </div>
  );
};

export default MapPage;
