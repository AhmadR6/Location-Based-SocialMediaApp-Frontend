import "./map.scss";

import NearbyUsers from "../../components/NearByUser/NearByUser";
import MapView from "../../components/MapView/MapView";
import EventsList from "../../components/CreateEvents/EventLists";

const MapPage = () => {
  return (
    <div className="content" id="home-page">
      <div className="content-main">
        <MapView />
      </div>
      <div className="content-side">
        <>
          <section className="side-content-box">
            <NearbyUsers />
          </section>
          <section className="side-content-box">
            <p>Nearby Events</p>
            <EventsList />
          </section>
        </>
      </div>
    </div>
  );
};

export default MapPage;
