import React, { useState } from "react";
import prisma from "~/db.server";

import type { CustomSale } from "@shopify/ui-extensions/point-of-sale";
import {
  ScrollView,
  Navigator,
  Button,
  RadioButtonList,
  TextArea,
  Screen,
  useApi,
  reactExtension,
} from "@shopify/ui-extensions-react/point-of-sale";

enum completionStatus {
  InProgress = "In Progress",
  Complete = "Complete",
  Paid = "Paid",
}

interface IworkOrders {
  id: number,
  name: string,
  price: string,
  status: string
}

const SmartGridModal = () => {
  const api = useApi<"pos.home.modal.render">();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0.00");
  const [status, setStatus] = useState("");
  const [workOrders, setWorkOrders] = useState<IworkOrders[]>([])

  const getWorkOrders = async () => {
    const newWorkOrders = await prisma.workOrder.findMany()

    setWorkOrders(newWorkOrders)
  }

  getWorkOrders()

  const onPay = async (id: number) => {
    const workOrder = await prisma.workOrder.findUnique({ where: { id: id } });
    // You can apply a discount through the cart API
    if (!workOrder) {
      return
    }
    const sale: CustomSale = {
      quantity: 1,
      price: workOrder.price,
      title: workOrder.name,
      taxable: true,
    };
    api.cart.addCustomSale(sale);

    workOrder.status = "Complete";

    await prisma.workOrder.update({
      where: { id: id },
      data: { status: "Complete" },
    });

    // You can show a toast to notify the user of something
    api.toast.show("Repair Added");
  };

  const onCreate = async (name: string, price: string, status: string) => {
    await prisma.workOrder.create({
      data: {
        name: name,
        price: price,
        status: status,
      },
    });
    getWorkOrders()
  };

  return (
    <Navigator>
      <Screen name="Work Orders" title="Current Work Orders">
        <ScrollView>
          <TextArea
            placeholder="Name"
            label="Name"
            onChange={(e) => setName(e)}
          />
          <TextArea
            placeholder="Price"
            label="Price"
            onChange={(e) => {
              setPrice(e);
            }}
          />
          <RadioButtonList
            items={[completionStatus.InProgress, completionStatus.Complete]}
            onItemSelected={setStatus}
            initialSelectedItem={status}
          />
          <Button
            title="Create"
            onPress={() => {
              onCreate(name, price, status);
            }}
          />
          <ScrollView>
            {workOrders.map((workOrder) => {
              return (
                <Button
                  key={workOrder.id}
                  title="Pay"
                  onPress={() => {
                    onPay(workOrder.id);
                  }}
                />
              );
            })}
          </ScrollView>
        </ScrollView>
      </Screen>
    </Navigator>
  );
};

export default reactExtension("pos.home.modal.render", () => {
  return <SmartGridModal />;
});
