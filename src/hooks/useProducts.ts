import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useProducts() {
  const [products, setProducts] = useState<any[]>([]);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*');
    setProducts(data || []);
  }

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        fetchProducts
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { products, refresh: fetchProducts };
}