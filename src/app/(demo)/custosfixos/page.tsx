"use client"

import Link from "next/link";

import PoeticForm from "@/components/poetic-form";

import PlaceholderContent from "@/components/demo/placeholder-content";
import { ContentLayout } from "@/components/admin-panel/content-layout";


export default function TagsPage() {
  return (
    <ContentLayout title="Tags">
     


    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Custo Fixo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valor Mensal</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">Soundcloud for Artists</td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">EUR 3.00</td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">Verces Hosting</td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">EUR 20.00</td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">Shopify</td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">EUR 5.00</td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">diepretty.pt</td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">EUR 2.50</td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">DistroKid</td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">EUR 2.50</td>
          </tr>
          <tr className="font-bold">
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">Total</td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">EUR 33.00</td>
          </tr>
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">Estimativa Anual</td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">EUR 396.00</td>
          </tr>
        </tbody>
      </table>
    </div>















    </ContentLayout>
  );
}
