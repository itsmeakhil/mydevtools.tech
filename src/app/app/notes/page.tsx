// pages/index.tsx or app/page.tsx
import DynamicEditor from "../../../components/DynamicEditor";

export default function HomePage() {
  return (
    <div>
      <h1>My Notion-like Editor</h1>
      <DynamicEditor />
    </div>
  );
}
