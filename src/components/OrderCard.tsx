import { Button } from "@/components/ui/button";

export interface Order {
  id: string;
  totalAmount: number;
  totalItems: number;
  status: "Processing" | "Finished";
}

interface OrderCardProps {
  order: Order;
  onFinishOrder?: (orderId: string) => void;
}

export const OrderCard = ({ order, onFinishOrder }: OrderCardProps) => {
  const handleFinishOrder = () => {
    if (onFinishOrder) {
      onFinishOrder(order.id);
    }
  };

  return (
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h4 className="text-muted-foreground text-sm font-medium">
            Order ID
          </h4>
          <p className="font-mono text-sm">{order.id}</p>
        </div>
        <div
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            order.status === "Processing"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {order.status}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-muted-foreground text-sm font-medium">
            Total Amount
          </h4>
          <p className="text-lg font-bold">${order.totalAmount.toFixed(2)}</p>
        </div>
        <div>
          <h4 className="text-muted-foreground text-sm font-medium">
            Total Items
          </h4>
          <p className="text-lg font-bold">{order.totalItems}</p>
        </div>
      </div>

      {order.status === "Processing" && (
        <Button onClick={handleFinishOrder} className="w-full" size="sm">
          Finish Order
        </Button>
      )}
    </div>
  );
};
