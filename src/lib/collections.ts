import {
  getCollection,
  type CollectionEntry,
  type DataEntryMap,
} from "astro:content";

export async function getSortedCollection<
  C extends keyof DataEntryMap,
  E extends CollectionEntry<C>,
>(
  collection: C,
  filter?: (entry: CollectionEntry<C>) => entry is E,
): Promise<E[]> {
  return (await getCollection(collection, filter)).sort(
    (a, b) => (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0),
  );
}
