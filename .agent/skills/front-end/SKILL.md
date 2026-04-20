# 🛠 FRONT-END ARCHITECTURE & VIBE CODING STANDARDS

## 1. ROLE & PHILOSOPHY
- **Role**: Senior React Architect & Vibe Coding Specialist.
- **Goal**: Xây dựng trang web tra cứu bài kiểm tra trắc nghiệm.
- **Vibe Coding**: Ưu tiên tính tường minh, dễ bảo trì và tối ưu cho sự hợp tác giữa người và AI.

## 2. CORE TECH STACK
- **Framework**: React 19 (Vite).
- **Language**: TypeScript (Strict Mode, No `any`).
- **Styling**: 
  <!-- - Ưu tiên: CSS Modules hoặc Inline Styles tùy ngữ cảnh. -->
  - **Lưu ý quan trọng**: Chỉ dùng Tailwind CSS khi được yêu cầu cụ thể.
- **UI Components**: Ant Design.
- **State Management**: 
  - Server State: TanStack Query v5 (Quản lý cache & sync dữ liệu).
  - Client State: Zustand (Global state đơn giản).
- **Forms**: React Hook Form + Zod (Schema Validation).
- **Icons**: Lucide React.

## 3. CODING STANDARDS (THE "VIBE")
### Naming Conventions
- **Components**: `PascalCase` (e.g., `EmployeeProfileCard.tsx`).
- **Hooks**: `camelCase` bắt đầu bằng 'use' (e.g., `useInsuranceCalculator.ts`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`).
- **Services/Utils**: `camelCase` (e.g., `formatCurrency.ts`).

### Component Structure
1. **Imports**: (External Libraries -> Internal Components -> Types -> Styles).
2. **Types/Interfaces**: Định nghĩa rõ ràng Props và Data Shape.
3. **Logic**: Khai báo Hooks, Local State, Handlers.
4. **Render**: Trả về JSX với destructuring props.
5. **Export**: Luôn sử dụng `export default`.

### Modern Syntax
- Ưu tiên Optional Chaining (`?.`) và Nullish Coalescing (`??`).
- Không dùng `useEffect` cho việc biến đổi dữ liệu; sử dụng `useMemo`.
- Tách biệt Logic nghiệp vụ ra Custom Hooks.

## 4. PROJECT ARCHITECTURE (FEATURE-BASED)
Dự án được tổ chức theo từng module nghiệp vụ để dễ dàng thêm nhân sự:

```text
src/
├── components/ui/          # Nguyên tử UI dùng chung (Button, Input, Modal)
├── features/               # Thư mục chứa các module nghiệp vụ chính
│   ├── employee-mgmt/      # Module quản lý nhân viên
│   │   ├── components/     # UI đặc thù của module
│   │   ├── hooks/          # Logic xử lý nghiệp vụ (useEmployees...)
│   │   ├── services/       # API calls & Types định nghĩa cho module
│   │   └── index.ts        # Public API cho module
│   └── payroll/            # Module tính lương
├── hooks/                  # Hooks dùng chung toàn app
├── store/                  # Zustand slices
└── lib/                    # Utils, Axios config, Zod schemas chung
```

## 5. PERFORMANCE & UI/UX RULES
Hệ thống quản lý yêu cầu sự mượt mà và tin cậy cao về dữ liệu.

- **Optimistic UI**: 
  - Luôn sử dụng `onMutate` trong **TanStack Query** cho các hành động tương tác trực tiếp.
  - UI phải cập nhật ngay lập tức trước khi Server phản hồi.
- **Loading Architecture**: 
  - Không sử dụng Spinner/Overlay che toàn màn hình. 
  - Phải sử dụng **Skeleton Screens** có kích thước và hình dáng tương đồng với dữ liệu thực tế để tránh nhảy Layout (Cumulative Layout Shift).
- **Complex Tables & Data**: 
  - Mặc định thực hiện Pagination, Sorting và Filtering tại **Server-side**.
  - Sử dụng `useDeferredValue` cho các ô Search input để tránh lag UI khi filter danh sách lớn.
- **Accessibility (A11y)**: 
  - Đảm bảo đầy đủ ARIA labels. 
  - Luôn hỗ trợ phím tắt hoặc điều hướng phím `Tab` cho các form nhập liệu nghiệp vụ dài.

## 6. ERROR HANDLING & VALIDATION
Nguyên tắc: "Validation sớm, Thông báo rõ".

- **Zod-First Strategy**: 
  - Mọi luồng dữ liệu (Form, API Response) phải đi qua **Zod Schema**.
  - Định nghĩa Schema tập trung tại thư mục `services/` hoặc `lib/`.
- **Localized Messages**: 
  - Thông báo lỗi phải được viết bằng **Tiếng Việt**.
  - Tránh các câu thông báo kỹ thuật chung chung (ví dụ: thay "Invalid input" bằng "Ngày bắt đầu không được sau ngày kết thúc").
- **User Feedback**: 
  - Sử dụng thư viện `sonner` hoặc `toast` để thông báo trạng thái.
  - Lỗi nghiêm trọng (Crash) phải được bắt bởi **Error Boundary** ở cấp độ Module.

## 7. WORKFLOW INSTRUCTIONS (FOR AI COLLABORATION)
Các chỉ dẫn dành riêng cho AI (Cursor/Antigravity) khi thực hiện code:

> [!IMPORTANT]
> "Khi mình yêu cầu một chức năng mới, hãy thực hiện theo các bước sau:"

1. **Schema & Types**: Định nghĩa Zod Schema và TypeScript Interface trước khi viết bất kỳ code UI nào.
2. **Separation of Concerns**: Tách biệt hoàn toàn phần xử lý dữ liệu (Business Logic) vào Custom Hooks. Component chỉ chứa logic hiển thị.
3. **Refactor Alert**: Nếu file Component hoặc Hook vượt quá **200 dòng**, AI phải chủ động đề xuất cách tách nhỏ module.
4. **Dependency Audit**: Luôn kiểm tra mảng dependency của `useMemo`, `useCallback` và `useEffect` để tránh lỗi re-render vô hạn.
5. **UI Consistency**: Trước khi tạo component mới, hãy kiểm tra thư mục `src/components/ui` xem đã có component nguyên tử (Atomic) nào có thể tái sử dụng chưa.

## 8. DOCUMENTATION & COMMENTING STANDARDS
Yêu cầu bắt buộc để duy trì tính minh bạch của nghiệp vụ và hỗ trợ Onboarding nhanh.

### Nguyên tắc chung
- **Ngôn ngữ**: Tất cả comment phải viết bằng **Tiếng Việt**.
- **Vị trí**: Áp dụng nghiêm ngặt cho `src/components/ui` (dùng chung) và `src/features/` (màn hình nghiệp vụ).

### Đối với Component dùng chung (Shared Components)
Sử dụng định dạng **JSDoc** để mô tả Props và cách dùng:
- Giải thích rõ ý nghĩa của các Props khó hiểu.
- Ghi chú các trường hợp (Edge cases) cần lưu ý khi tái sử dụng.

### Đối với Màn hình chức năng phức tạp
- **Logic Header**: Ở đầu mỗi file Hook hoặc Component nghiệp vụ, phải có 1 đoạn comment ngắn mô tả: "Chức năng này làm gì? Thuộc quy trình nghiệp vụ nào?".
- **Complex Logic**: Giải thích "Tại sao lại xử lý như vậy?" thay vì chỉ giải thích "Code này làm gì?".
- **Business Rules**: Các công thức tính toán (ví dụ: công thức tính lương, bảo hiểm) phải được comment rõ ràng nguồn gốc hoặc quy định tương ứng.

### Ví dụ mẫu (For AI to follow):
```typescript
/**
 * Component hiển thị trạng thái hồ sơ nhân sự.
 * @param status - Mã trạng thái từ Backend (1: Đang chờ, 2: Đã duyệt...)
 * @param updatedAt - Ngày cập nhật cuối cùng
 */
const StatusBadge = ({ status, updatedAt }: StatusProps) => {
  // Logic: Nếu trạng thái là 'Đang chờ' quá 3 ngày thì hiển thị cảnh báo đỏ
  const isOverdue = checkOverdue(updatedAt);
  
  return (
    // Render UI...
  );
};
```

## 8. WORKFLOW INSTRUCTIONS (UPDATED FOR COMMENTS)
Bổ sung chỉ dẫn cho AI:
- Khi tạo file mới, hãy luôn bắt đầu bằng một đoạn comment JSDoc bằng Tiếng Việt mô tả mục đích của file.
- Trước các đoạn logic tính toán nghiệp vụ phức tạp, hãy thêm comment giải thích từng bước thực hiện bằng Tiếng Việt. Không comment những thứ hiển nhiên (ví dụ: `i++ // tăng i`).
- Nếu mình yêu cầu refactor, hãy giữ lại các comment nghiệp vụ cũ hoặc cập nhật chúng cho phù hợp với code mới.
