import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approvePayment,
  approvePenalty,
  checkInBilling,
  checkInByPhone,
  getStationBillings,
  inspectReturn,
  StaffBillingResponse,
  StaffBillingStatus,
} from "@/services/staffBillingService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Car, User, Calendar, Clock, RefreshCw } from "lucide-react";

const statusMeta: Record<
  StaffBillingStatus,
  { label: string; badgeClass: string }
> = {
  WAITING: { label: "Chờ thanh toán", badgeClass: "bg-gray-100 text-gray-800" },
  PAYED: { label: "Đã thanh toán", badgeClass: "bg-blue-100 text-blue-800" },
  RENTING: { label: "Đang thuê", badgeClass: "bg-yellow-100 text-yellow-800" },
  DONE: { label: "Hoàn thành", badgeClass: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Đã hủy", badgeClass: "bg-red-100 text-red-800" },
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toLower = (value?: string | null) =>
  typeof value === "string" ? value.toLowerCase() : "";

type ActionKey =
  | "APPROVE_PAYMENT"
  | "CHECK_IN"
  | "CHECK_IN_BY_PHONE"
  | "INSPECT_RETURN"
  | "APPROVE_PENALTY";

interface ActionOption {
  key: ActionKey;
  label: string;
}

const buildActions = (billing: StaffBillingResponse): ActionOption[] => {
  const actions: ActionOption[] = [];
  switch (billing.status) {
    case "WAITING":
      actions.push({
        key: "APPROVE_PAYMENT",
        label: "Duyệt thanh toán (WAITING → PAYED)",
      });
      break;
    case "PAYED":
      actions.push({
        key: "CHECK_IN",
        label: "Check-in (PAYED → RENTING)",
      });
      actions.push({
        key: "CHECK_IN_BY_PHONE",
        label: "Check-in bằng số điện thoại",
      });
      break;
    case "RENTING":
      actions.push({
        key: "INSPECT_RETURN",
        label: "Ghi nhận trả xe",
      });
      if (billing.penaltyCost && billing.penaltyCost > 0) {
        actions.push({
          key: "APPROVE_PENALTY",
          label: "Duyệt thanh toán tiền phạt",
        });
      }
      break;
    default:
      break;
  }
  return actions;
};

const StationStaffOrders = () => {
  const [billings, setBillings] = useState<StaffBillingResponse[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<StaffBillingStatus | "all">(
    "all",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStationBillings();
      setBillings(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không tải được danh sách hóa đơn của trạm.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const replaceBilling = (next: StaffBillingResponse) => {
    setBillings((prev) => {
      const index = prev.findIndex((item) => item.id === next.id);
      if (index === -1) {
        return [next, ...prev];
      }
      const clone = [...prev];
      clone[index] = next;
      return clone;
    });
  };

  const filtered = useMemo(() => {
    const keyword = toLower(search);
    return billings.filter((billing) => {
      if (filterStatus !== "all" && billing.status !== filterStatus) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      return [
        billing.id?.toString() ?? "",
        billing.vehicleModel ?? "",
        billing.renterName ?? "",
        billing.renterEmail ?? "",
      ]
        .map(toLower)
        .some((v) => v.includes(keyword));
    });
  }, [billings, filterStatus, search]);

  const handleAction = async (
    billing: StaffBillingResponse,
    action: ActionKey
  ) => {
    try {
      setActionLoading(true);
      switch (action) {
        case "APPROVE_PAYMENT": {
          const updated = await approvePayment(billing.id);
          replaceBilling(updated);
          break;
        }
        case "CHECK_IN": {
          const preImage = window
            .prompt("Nhập đường dẫn ảnh trước khi giao xe (tuỳ chọn):")
            ?.trim();
          const updated = await checkInBilling(
            billing.id,
            preImage ? { preImage } : undefined
          );
          replaceBilling(updated);
          break;
        }
        case "CHECK_IN_BY_PHONE": {
          const phone = window
            .prompt(
              "Nhập số điện thoại khách hàng để tìm hóa đơn PAYED và check-in:"
            )
            ?.trim();
          if (!phone) break;
          const preImage = window
            .prompt("Nhập đường dẫn ảnh trước khi giao xe (tuỳ chọn):")
            ?.trim();
          const updated = await checkInByPhone(
            phone,
            preImage ? { preImage } : undefined
          );
          replaceBilling(updated);
          break;
        }
        case "INSPECT_RETURN": {
          const finalImage = window
            .prompt("Nhập đường dẫn ảnh khi khách trả xe (bắt buộc):")
            ?.trim();
          if (!finalImage) {
            alert("Bạn phải nhập ảnh khi xe được trả.");
            break;
          }
          const penaltyInput = window
            .prompt(
              "Nhập số tiền phạt (để trống hoặc 0 nếu không áp dụng):",
              billing.penaltyCost ? String(billing.penaltyCost) : ""
            )
            ?.trim();
          const note = window
            .prompt(
              "Ghi chú gửi cho khách (tuỳ chọn, hiển thị trong phản hồi):",
              billing.note ?? ""
            )
            ?.trim();

          let penaltyCost: number | undefined;
          if (penaltyInput) {
            const parsed = Number(penaltyInput);
            if (Number.isNaN(parsed) || parsed < 0) {
              alert("Số tiền phạt không hợp lệ.");
              break;
            }
            penaltyCost = parsed;
          }

          const updated = await inspectReturn(billing.id, {
            finalImage,
            penaltyCost,
            note,
          });
          replaceBilling(updated);
          break;
        }
        case "APPROVE_PENALTY": {
          const confirmed = window.confirm(
            "Xác nhận khách hàng đã thanh toán tiền phạt và hoàn tất hóa đơn?"
          );
          if (!confirmed) break;
          const updated = await approvePenalty(billing.id);
          replaceBilling(updated);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Không thực hiện được thao tác. Vui lòng thử lại."
      );
    } finally {
      setActionLoading(false);
      void refresh();
    }
  };  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Tìm theo mã đơn, tên khách, email, xe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-lg"
        />
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Select
            value={filterStatus}
            onValueChange={(value) =>
              setFilterStatus(value as StaffBillingStatus | "all")
            }
          >
            <SelectTrigger className="sm:w-64">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="WAITING">{statusMeta.WAITING.label}</SelectItem>
              <SelectItem value="PAYED">{statusMeta.PAYED.label}</SelectItem>
              <SelectItem value="RENTING">{statusMeta.RENTING.label}</SelectItem>
              <SelectItem value="DONE">{statusMeta.DONE.label}</SelectItem>
              <SelectItem value="CANCELLED">
                {statusMeta.CANCELLED.label}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => void refresh()}
            disabled={loading || actionLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                loading ? "animate-spin text-primary" : ""
              }`}
            />
            Làm mới
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hóa đơn tại trạm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">Đang tải...</div>
          ) : null}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Xe</TableHead>
                  <TableHead>Nhận xe</TableHead>
                  <TableHead>Trả xe</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Tiền phạt</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm">
                      Không có hóa đơn nào phù hợp.
                    </TableCell>
                  </TableRow>
                ) : null}
                {filtered.map((billing) => {
                  const meta = statusMeta[billing.status];
                  return (
                    <TableRow key={billing.id}>
                      <TableCell className="font-medium">
                        #{billing.id}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {billing.renterName || "Khách vãng lai"}
                          </div>
                          {billing.renterEmail && (
                            <div className="pl-6 text-xs text-muted-foreground">
                              {billing.renterEmail}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          {billing.vehicleModel || `Xe #${billing.vehicleId}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDateTime(billing.startTime)}
                          </div>
                          {billing.preImage && (
                            <div className="pl-6 text-xs text-muted-foreground truncate max-w-[200px]">
                              <a
                                href={billing.preImage}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                Ảnh nhận xe
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {formatDateTime(billing.endTime)}
                          </div>
                          {billing.finalImage && (
                            <div className="pl-6 text-xs text-muted-foreground truncate max-w-[200px]">
                              <a
                                href={billing.finalImage}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                Ảnh trả xe
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={meta.badgeClass}>{meta.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {billing.penaltyCost && billing.penaltyCost > 0 ? (
                          <div className="text-sm text-red-600 font-semibold">
                            {billing.penaltyCost.toLocaleString("vi-VN")}₫
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Không
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {(() => {
                          const actions = buildActions(billing);
                          if (actions.length === 0) {
                            return (
                              <span className="text-xs text-muted-foreground">
                                Không có thao tác
                              </span>
                            );
                          }
                          return (
                            <Select
                              onValueChange={(value) =>
                                void handleAction(billing, value as ActionKey)
                              }
                              disabled={actionLoading}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn thao tác" />
                              </SelectTrigger>
                              <SelectContent>
                                {actions.map((item) => (
                                  <SelectItem key={item.key} value={item.key}>
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StationStaffOrders;
