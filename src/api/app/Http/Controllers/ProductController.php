<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Category;
use App\Models\Store;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function show(Product $product)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Product $product)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function destroy(Product $product)
    {
        //
    }

    public function getProductByCategory(Request $request) {
        $category = $request->category;

        $pid = ProductCategory::select('pid')
        ->join('category', 'category.id', '=', 'product_category.category_id');
        if($category){
            $pid = $pid->where('category.title', 'like', '%'.$category.'%');
        }
        $product = Product::whereIn('pid', $pid)->get();
        return response()->json([
            'status' => 'success',
            'test' => $request->path(),
            'category' => $category,
            'products' => $product,
        ], 200);
    }

    public function getStoreById($id){
       
        $store = Store::find($id);
        return response()->json($store);
    }
   
    public function findProductById($id){
        $product = Product::find($id);
        return response()->json($product);
    }

    public function getProductBySid($sid){
        $product = Product::where('sid', $sid)->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $product,
        ], 200);
    }
    




}
