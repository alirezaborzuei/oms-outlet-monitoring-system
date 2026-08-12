"use client";
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchItemsSUH, selectUnvisitedCount } from '../../lib/store/itemsSlice';
import { setPsekodu } from '@/lib/store/selectedItemSlice';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import AuthWrapper from '@/components/AuthWrapper';

const List = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const items = useSelector(state => state.items.items);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const token = useSelector(state => state.auth.token);
  const username = useSelector(state => state.auth.user);
  const unvisitedCount = useSelector(selectUnvisitedCount);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [flowFilter, setFlowFilter] = useState('');
  const role = useSelector(state => state.auth.role);

  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchItemsSUH(token, username));
    }
  }, [dispatch, isAuthenticated, token, username]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleFlowFilterChange = (e) => {
    setFlowFilter(e.target.value);
  };

  const filteredItems = items
    .filter(item => {
      // Filter based on search term (you can adjust the filtering logic based on which fields you want to search)
      const searchLower = search.toLowerCase();
      return item.distkodu.toLowerCase().includes(searchLower) || 
             (item.unvan && item.unvan.toLowerCase().includes(searchLower)) ||
             (item.musterino && item.musterino.toLowerCase().includes(searchLower));
    });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOption === 'name') {
      return a.unvan.localeCompare(b.unvan);
    }
    if (sortOption === 'musterino') {
      return a.musterino.localeCompare(b.musterino);
    }
    if (sortOption === 'flow') {
      return (a.flow || 'بدون فعالیت').localeCompare(b.flow || 'بدون فعالیت');
    }
    return 0;
  });

  const handleClick = (item) => {
    const distkodu = item.distkodu;
    if (role === 'Admin') {
      router.push(`/Allattachment/${distkodu}`);
    } else {
      dispatch(setPsekodu(item.distkodu));
      router.push(`/customer/${distkodu}`);
    }
  };

  return (
    <Layout>
      <AuthWrapper>
        <div className="max-w-4xl mx-auto px-4 py-8" style={{ direction: 'rtl' }}>
          <h1 className="text-3xl font-bold mb-4">نمایندگی‌ها</h1>
          <div className="mb-4 flex flex-col md:flex-row md:justify-between gap-4">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="جستجو..."
              className="w-full md:w-auto flex-grow px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-blue-400"
              style={{ textAlign: 'right' }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {sortedItems.map((item, index) => (
              <div
                key={`${item.distkodu}-${index}`}
                onClick={() => handleClick(item)}
                className="cursor-pointer bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between transition-transform duration-300 hover:scale-105"
                style={{ textAlign: 'center' }}
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">{item.distkodu}</h2>
              </div>
            ))}
          </div>
        </div>
      </AuthWrapper>
    </Layout>
  );
};

export default List;
