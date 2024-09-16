import React, { useState } from "react";

import {
  Tile,
  useApi,
  reactExtension,
} from "@shopify/ui-extensions-react/point-of-sale";

const SmartGridTile = () => {
  const api = useApi<"pos.home.tile.render">();

  const shouldEnable = (subtotal: string): boolean => {
    return true
  };

  // You can use the initial cart value to set up state
  const [enabled, setEnabled] = useState(
    shouldEnable(api.cart.subscribable.initial.subtotal),
  );

  // You can subscribe to changes in the cart to mutate state
  api.cart.subscribable.subscribe((cart) => {
    setEnabled(shouldEnable(cart.subtotal));
  });

  return (
    <Tile
      title="Work Orders"
      subtitle="Work in Progress DO NOT USE"
      onPress={api.action.presentModal}
      enabled={enabled}
    />
  );
};

export default reactExtension("pos.home.tile.render", () => {
  return <SmartGridTile />;
});
