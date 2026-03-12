export type Fee = {
  _id: string;
  name: string;
  amount: number;
  type: "fixed" | "percentage";
  isArchive?: boolean;
};
