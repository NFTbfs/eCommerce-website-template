import { connect } from 'react-redux';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Collapse from 'react-bootstrap/Collapse';

import ALink from '~/components/features/custom-link';
import Countdown from '~/components/features/countdown';
import Quantity from '~/components/features/quantity';

import ProductNav from '~/components/partials/product/product-nav';
import DescTwo from '~/components/partials/product/desc/desc-two';

import { wishlistActions } from '~/store/wishlist';
import { cartActions } from '~/store/cart';

import { toDecimal } from '~/utils';

function DetailOne( props ) {
    let router = useRouter();
    const { data, isSticky = false, isDesc = false, adClass = '' } = props;
    const { toggleWishlist, addToCart, wishlist } = props;
    const [ curColor, setCurColor ] = useState( 'null' );
    const [ curSize, setCurSize ] = useState( 'null' );
    const [ curIndex, setCurIndex ] = useState( 0 );
    const [ cartActive, setCartActive ] = useState( false );
    const [ quantity, setQauntity ] = useState( 1 );
    let product = data && data.product;

    // decide if the product is wishlisted
    let isWishlisted, colors = [], sizes = [];
    isWishlisted = wishlist.findIndex( item => item.slug === product.data.slug ) > -1 ? true : false;

    if ( product.data && product.data.variants.length > 0 ) {
        if ( product.data.variants[ 0 ].size )
            product.data.variants.forEach( item => {
                if ( sizes.findIndex( size => size.name === item.size.name ) === -1 ) {
                    sizes.push( { name: item.size.name, value: item.size.size } );
                }
            } );

        if ( product.data.variants[ 0 ].color ) {
            product.data.variants.forEach( item => {
                if ( colors.findIndex( color => color.name === item.color.name ) === -1 )
                    colors.push( { name: item.color.name, value: item.color.color } );
            } );
        }
    }

    useEffect( () => {
        setCurIndex( -1 );
        resetValueHandler();
    }, [ product ] )

    useEffect( () => {
        if ( product.data.variants.length > 0 ) {
            if ( ( curSize !== 'null' && curColor !== 'null' ) || ( curSize === 'null' && product.data.variants[ 0 ].size === null && curColor !== 'null' ) || ( curColor === 'null' && product.data.variants[ 0 ].color === null && curSize !== 'null' ) ) {
                setCartActive( true );
                setCurIndex( product.data.variants.findIndex( item => ( item.size !== null && item.color !== null && item.color.name === curColor && item.size.name === curSize ) || ( item.size === null && item.color.name === curColor ) || ( item.color === null && item.size.name === curSize ) ) );
            } else {
                setCartActive( false );
            }
        } else {
            setCartActive( true );
        }

        if ( product.stock === 0 ) {
            setCartActive( false );
        }
    }, [ curColor, curSize, product ] )

    const wishlistHandler = ( e ) => {
        e.preventDefault();

        if ( toggleWishlist && !isWishlisted ) {
            let currentTarget = e.currentTarget;
            currentTarget.classList.add( 'load-more-overlay', 'loading' );
            toggleWishlist( product.data );

            setTimeout( () => {
                currentTarget.classList.remove( 'load-more-overlay', 'loading' );
            }, 1000 );
        } else {
            router.push( '/pages/wishlist' );
        }
    }

    const toggleColorHandler = ( color ) => {
        if ( !isDisabled( color.name, curSize ) ) {
            if ( curColor === color.name ) {
                setCurColor( 'null' );
            } else {
                setCurColor( color.name );
            }
        }
    }

    const toggleSizeHandler = ( size ) => {
        if ( !isDisabled( curColor, size.name ) ) {
            if ( curSize === size.name ) {
                setCurSize( 'null' );
            } else {
                setCurSize( size.name );
            }
        }
    }

    const addToCartHandler = () => {
        if ( product.data.stock > 0 && cartActive ) {
            if ( product.data.variants.length > 0 ) {
                let tmpName = product.data.name, tmpPrice;
                tmpName += curColor !== 'null' ? '-' + curColor : '';
                tmpName += curSize !== 'null' ? '-' + curSize : '';

                if ( product.data.price[ 0 ] === product.data.price[ 1 ] ) {
                    tmpPrice = product.data.price[ 0 ];
                } else if ( !product.data.variants[ 0 ].price && product.data.discount > 0 ) {
                    tmpPrice = product.data.price[ 0 ];
                } else {
                    tmpPrice = product.data.variants[ curIndex ].sale_price ? product.data.variants[ curIndex ].sale_price : product.data.variants[ curIndex ].price;
                }

                addToCart( { ...product.data, name: tmpName, qty: quantity, price: tmpPrice } );
            } else {
                addToCart( { ...product.data, qty: quantity, price: product.data.price[ 0 ] } );
            }
        }
    }

    const resetValueHandler = ( e ) => {
        setCurColor( 'null' );
        setCurSize( 'null' );
    }

    function isDisabled( color, size ) {
        if ( color === 'null' || size === 'null' ) return false;

        if ( sizes.length === 0 ) {
            return product.data.variants.findIndex( item => item.color.name === curColor ) === -1;
        }

        if ( colors.length === 0 ) {
            return product.data.variants.findIndex( item => item.size.name === curSize ) === -1;
        }

        return product.data.variants.findIndex( item => item.color.name === color && item.size.name === size ) === -1;
    }

    function changeQty( qty ) {
        setQauntity( qty );
    }

    return (
        <div className={ `product-details ${ isSticky ? 'sticky' : '' } ${ adClass }` }>
            <div className="product-navigation">
                <ul className="breadcrumb breadcrumb-lg">
                    <li><ALink href="/"><i className="d-icon-home"></i></ALink></li>
                    <li><ALink href="#" className="active">Products</ALink></li>
                    <li>Detail</li>
                </ul>

                <ProductNav product={ product } />
            </div>

            <h2 className="product-name">{ product.data.name }</h2>

            <div className='product-meta'>
                SKU: <span className='product-sku'>{ product.data.sku }</span>
                CATEGORIES: <span className='product-brand'>
                    {
                        product.data.categories.map( ( item, index ) =>
                            <React.Fragment key={ item.name + '-' + index }>
                                <ALink href={ { pathname: '/shop', query: { category: item.slug } } }>
                                    { item.name }
                                </ALink>
                                { index < product.data.categories.length - 1 ? ', ' : '' }
                            </React.Fragment>
                        ) }
                </span>
            </div>

            <div className="product-price">
                {
                    product.data.price[ 0 ] !== product.data.price[ 1 ] ?
                        product.data.variants.length === 0 || ( product.data.variants.length > 0 && !product.data.variants[ 0 ].price ) ?
                            <>
                                <ins className="new-price">${ toDecimal( product.data.price[ 0 ] ) }</ins>
                                <del className="old-price">${ toDecimal( product.data.price[ 1 ] ) }</del>
                            </>
                            :
                            < del className="new-price">${ toDecimal( product.data.price[ 0 ] ) } – ${ toDecimal( product.data.price[ 1 ] ) }</del>
                        : <ins className="new-price">${ toDecimal( product.data.price[ 0 ] ) }</ins>
                }
            </div>

            {
                product.data.price[ 0 ] !== product.data.price[ 1 ] && product.data.variants.length === 0 ?
                    <Countdown type={ 2 } /> : ''
            }

            <div className="ratings-container">
                <div className="ratings-full">
                    <span className="ratings" style={ { width: 20 * product.data.ratings + '%' } }></span>
                    <span className="tooltiptext tooltip-top">{ toDecimal( product.data.ratings ) }</span>
                </div>

                <ALink href="#" className="rating-reviews">( { product.data.reviews } reviews )</ALink>
            </div>

            <p className="product-short-desc">{ product.data.short_description }</p>

            {
                product && product.data.variants.length > 0 ?
                    <>
                        {
                            product.data.variants[ 0 ].color ?
                                <div className='product-form product-color'>
                                    <label>Color:</label>

                                    <div className="product-variations">
                                        {
                                            colors.map( item =>
                                                <ALink href="#" className={ `color ${ curColor === item.name ? 'active' : '' } ${ isDisabled( item.name, curSize ) ? 'disabled' : '' }` } key={ "color-" + item.name } style={ { backgroundColor: `${ item.value }` } } onClick={ ( e ) => toggleColorHandler( item ) }></ALink> )
                                        }
                                    </div>
                                </div> : ''
                        }

                        {
                            product.data.variants[ 0 ].size ?
                                <div className='product-form product-size mb-0 pb-2'>
                                    <label>Size:</label>

                                    <div className="product-form-group">
                                        <div className="product-variations">
                                            {
                                                sizes.map( item =>
                                                    <ALink href="#" className={ `size ${ curSize === item.name ? 'active' : '' } ${ isDisabled( curColor, item.name ) ? 'disabled' : '' }` } key={ "size-" + item.name } onClick={ ( e ) => toggleSizeHandler( item ) }>{ item.value }</ALink> )
                                            }
                                        </div>

                                        <Collapse in={ 'null' !== curColor || 'null' !== curSize }>
                                            <div className="card-wrapper overflow-hidden reset-value-button w-100 mb-0">
                                                <ALink href='#' className='product-variation-clean' onClick={ resetValueHandler }>Clean All</ALink>
                                            </div>
                                        </Collapse>
                                    </div>
                                </div> : ''
                        }

                        <div className='product-variation-price'>
                            <Collapse in={ cartActive && curIndex > -1 }>
                                <div className="card-wrapper">
                                    {
                                        curIndex > -1 ?
                                            <div className="single-product-price">
                                                {
                                                    product.data.variants[ curIndex ].price ?
                                                        product.data.variants[ curIndex ].sale_price ?
                                                            <div className="product-price mb-0">
                                                                <ins className="new-price">${ toDecimal( product.data.variants[ curIndex ].sale_price ) }</ins>
                                                                <del className="old-price">${ toDecimal( product.data.variants[ curIndex ].price ) }</del>
                                                            </div>
                                                            : <div className="product-price mb-0">
                                                                <ins className="new-price">${ toDecimal( product.data.variants[ curIndex ].price ) }</ins>
                                                            </div>
                                                        : ""
                                                }
                                            </div> : ''
                                    }
                                </div>
                            </Collapse>
                        </div>

                    </>
                    : ''
            }

            <hr className="product-divider"></hr>

            <div className="product-form product-qty pb-0">
                <label className="d-none">QTY:</label>
                <div className="product-form-group">
                    <Quantity max={ product.data.stock } product={ product } onChangeQty={ changeQty } />
                    <button className={ `btn-product btn-cart text-normal ls-normal font-weight-semi-bold ${ cartActive ? '' : 'disabled' }` } onClick={ addToCartHandler } onClick={ addToCartHandler }><i className='d-icon-bag'></i>Add to Cart</button>
                </div>
            </div>

            <hr className="product-divider mb-3"></hr>

            <div className="product-footer">
                <div className="social-links mr-4">
                    <ALink href="#" className="social-link social-facebook fab fa-facebook-f"></ALink>
                    <ALink href="#" className="social-link social-twitter fab fa-twitter"></ALink>
                    <ALink href="#" className="social-link social-pinterest fab fa-pinterest-p"></ALink>
                </div> <span className="divider d-lg-show"></span> <a href="#" className={ `btn-product btn-wishlist` } title={ isWishlisted ? 'Browse wishlist' : 'Add to wishlist' } onClick={ wishlistHandler }>
                    <i className={ isWishlisted ? "d-icon-heart-full" : "d-icon-heart" }></i> {
                        isWishlisted ? 'Browse wishlist' : 'Add to Wishlist'
                    }
                </a>
            </div>

            {
                isDesc ? <DescTwo product={ product.data } adClass={ adClass } /> : ''
            }
        </div >
    )
}

function mapStateToProps( state ) {
    return {
        wishlist: state.wishlist.data ? state.wishlist.data : []
    }
}

export default connect( mapStateToProps, { toggleWishlist: wishlistActions.toggleWishlist, addToCart: cartActions.addToCart } )( DetailOne );