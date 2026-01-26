import Badge from "../ui/Badge";
import { categories } from "../../lib/placeholder";

export default function Categories() {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold">Kategori</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Badge key={c}>{c}</Badge>
        ))}
      </div>
    </section>
  );
}
