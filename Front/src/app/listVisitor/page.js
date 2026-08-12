"use client";
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchItems, selectItem, selectUnvisitedCount } from '../../lib/store/itemsSlice';
import { clearVisitID } from '../../lib/store/itemSlice';
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

  const flowDisplayMap = {
    '': 'بازدید نشده',
    'Draft': 'در انتظار تأیید فروشنده',
    'Supervisor': 'در انتظار تأیید سرپرست فروش',
    'Specialist': 'در انتظار تأیید کارشناس آموزش و مرچندایزینگ',
    'Finished': 'تمام شده',
    'Rejected by Supervisor': 'رد شده توسط سرپرست فروش',
    'Rejected by Specialist': 'رد شده توسط کارشناس آموزش و مرچندایزینگ',
  };

  const flowInternalMap = {
    'بازدید نشده': '',
    'در انتظار تأیید فروشنده': 'Draft',
    'در انتظار تأیید سرپرست فروش': 'Supervisor',
    'در انتظار تأیید کارشناس آموزش و مرچندایزینگ': 'Specialist',
    'تمام شده': 'Finished',
    'رد شده توسط سرپرست فروش': 'Rejected by Supervisor',
    'رد شده توسط کارشناس آموزش و مرچندایزینگ': 'Rejected by Specialist',
  };

  useEffect(() => {
    dispatch(clearVisitID()); // Clear visitID
    if (isAuthenticated && token) {
      dispatch(fetchItems(token, username));
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

  // Adjust the filtering to use the internal flow values
  const filteredItems = items
    .filter(item =>
      item.unvan?.includes(search) ||
      item.musterino?.includes(search)
    )
    .filter(item => flowFilter === '' || item.flow === flowInternalMap[flowFilter] || (flowFilter === 'unvisited' && !item.flow));

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOption === 'name') {
      return a.unvan.localeCompare(b.unvan);
    }
    if (sortOption === 'musterino') {
      return a.musterino.localeCompare(b.musterino);
    }
    if (sortOption === 'pG4ADI') {
      return a.pG4ADI.localeCompare(b.pG4ADI);
    }
    if (sortOption === 'flow') {
      return (a.flow || 'باز‌دید نشده').localeCompare(b.flow || 'باز‌دید نشده');
    }
    return 0;
  });

  const handleClick = (item) => {
    dispatch(selectItem(item));
    router.push(`/detailVisitor/${item.musterino}`);
  };

  
  // Extract unique flow values for filter dropdown
  const uniqueFlows = [...new Set(items.map(item => item.flow))].filter(Boolean);

  // Calculate statistics
  const totalCustomers = items.length;
  const approvedCount = items.filter(item => item.flow === 'Finished').length;
  const pendingCount = items.filter(item => item.flow === 'Supervisor' || item.flow === 'Specialist').length;
  const unvisitedCounts = items.filter(item => !item.flow || item.flow ==='Draft'|| item.flow === 'Rejected by Specialist' || item.flow === 'Rejected by Supervisor' ).length;
  const approvedPercentage = totalCustomers > 0 ? ((approvedCount / totalCustomers) * 100).toFixed(1) : 0;

  return (
    <Layout>
      <AuthWrapper>
        <div className="max-w-4xl mx-auto px-4 py-8" style={{ direction: 'rtl' }}>
          <h1 className="text-3xl font-bold mb-4">لیست مشتریان</h1>
          <div className="mb-4 flex flex-col md:flex-row md:justify-between gap-4">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="جستجوی مشتریان..."
              className="w-full md:w-auto flex-grow px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-blue-400"
              style={{ textAlign: 'right' }}
            />
            <select
              value={sortOption}
              onChange={handleSortChange}
              className="w-full md:w-auto flex-grow px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-blue-400"
              style={{ textAlign: 'right' }}
            >
              <option value="">مرتب سازی بر اساس...</option>
              <option value="name">نام</option>
              <option value="musterino">شماره مشتری</option>
              <option value="flow">وضعیت</option>
              <option value="pG4ADI">گروه</option>
            </select>
            <select
              value={flowFilter}
              onChange={handleFlowFilterChange}
              className="w-full md:w-auto flex-grow px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-blue-400"
              style={{ textAlign: 'right' }}
            >
              <option value="">فیلتر براساس وضعیت...</option>
              {Object.entries(flowDisplayMap).map(([internalValue, displayValue]) => (
                <option key={internalValue} value={displayValue}>{displayValue}</option>
              ))}
                 </select>
          </div>
   
          <div className="mb-4 flex flex-col md:flex-row md:justify-between gap-4">
            <div>کل مشتریان: {totalCustomers}</div>
            <div>تأییدشده: {approvedCount}</div>
            <div>در انتظار: {pendingCount}</div>
            <div>بازدید نشده: {unvisitedCounts}</div>
            <div>محقق شده: {approvedPercentage}%</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {sortedItems.map((item, index) => (
              <div
                key={`${item.musterino}-${index}`}
                onClick={() => handleClick(item)}
                className="cursor-pointer bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between transition-transform duration-300 hover:scale-105"
                style={{ textAlign: 'right' }}
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">{item.unvan}</h2>
                <p className="text-gray-600 mb-2">{item.musterino}</p>
                <p className="text-gray-600 mb-2">{item.pG4ADI}</p>
                <p className="text-gray-600">
                  {flowDisplayMap[item.flow] || 'بازدید نشده'} 
                </p> 
              </div>
            ))}
          </div>
        </div>
      </AuthWrapper>
    </Layout>
  );
};

export default List;
