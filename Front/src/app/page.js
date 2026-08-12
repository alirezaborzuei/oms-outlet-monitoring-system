'use client';
import { MyApp } from '../pages/_app';
import Layout from '@/components/Layout';

export default function Home() {
  return (
    <Layout>
      <ActualHomePageComponent />
    </Layout>
  );
}


function ActualHomePageComponent() {
  // Actual home page content
  return (
    <div></div>
 
  );
}