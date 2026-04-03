import React, {useState} from "react";
import Panel from "../layouts/navigatePanel/Panel";
import DeliveryMap from "./DeliveryMap";

const MapRender = ({deliveryPoints}) => {

  return (
    <DeliveryMap
        center={[37.618423, 55.751244]}
        zoom={12}
        warehouse={[37.618423, 55.751244]}
        deliveryPoints={deliveryPoints}
    />
  )
}

export default MapRender;