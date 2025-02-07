export default function (productData, locale) {
    const {uuid, pimid, title, teaser, description, price, currency, image, categories, url} = productData;

    const getPrice = price => {
        if (Number.isNaN(Number.parseFloat(price))) {
            console.warn(`The price : ${price} is not a number`);
            return 0;
        }

        return parseFloat(price);
    };

    return {
        // NOTE be sure string value like "false" or "true" are boolean I use JSON.parse to cast
        uuid,
        pimid: pimid.value,
        url: url.replace(/\/null\//, `/${locale}/`),
        title,
        teaser: teaser.value,
        description: description.value,
        image: {
            src: image?.node?.url || '',
            alt: image?.node?.name || 'no image'
        },
        categories: categories?.nodes?.map(cat => cat.title) || [],
        price: getPrice(price.value),
        currency: currency.value
    };
}
