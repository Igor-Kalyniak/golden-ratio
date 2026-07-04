import { Calculator } from "../components/Calculator";

/**
 * Server Component (TC-CLIENT-01): renders only the single `Calculator` client boundary,
 * which owns the application state and mounts the language provider.
 */
export default function Home() {
  return <Calculator />;
}
