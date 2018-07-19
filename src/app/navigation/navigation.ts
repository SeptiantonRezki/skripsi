export const navigation = [
    {
        'id'      : 'home',
        'title'   : 'Home',
        'translate': 'Home',
        'type'    : 'group',
        'children': [
            {
                'id'   : 'dashboard',
                'title': 'Dashboard',
                'translate': 'Dashboard',
                'type' : 'item',
                'icon' : 'home',
                'url'  : '/dashboard'
            }
        ]
    },
    {
        'id'    : 'admin-management',
        'title' : 'admin-management',
        'translate':'admin Management',
        'type' :'group',
        'children' : [
            {
                'id':'user',
                'title':'user',
                'translate':'User',
                'type':'item',
                'icon':'people',
                'url':'/admin/user'
            },
            {
                'id':'role',
                'title':'role',
                'translate':'Role',
                'type':'item',
                'icon':'people',
                'url':'/admin/role'
            }
        ]
    },
    {
        'id'      : 'e-order',
        'title'   : 'E-Order Management',
        'translate': 'E-Order Management',
        'type'    : 'group',
        'children': [
            {
                'id'   : 'view-e-order',
                'title': 'View E-Order',
                'translate': 'View E-Order',
                'type' : 'item',
                'icon' : 'shopping_cart',
                'url'  : '/e-order/view'
            },
             {
                'id'   : 'e-order-status',
                'title': 'E-Order Status',
                'translate': 'E-Order Status',
                'type' : 'item',
                'icon' : 'mail',
                'url'  : '/e-order/status'
            },
            {
                'id'   : 'delivery-status',
                'title': 'Delivery Status',
                'translate': 'Delivery Status',
                'type' : 'item',
                'icon' : 'calendar_today',
                'url'  : '/delivery/status'
            },
             {
                'id'   : 'e-order-history',
                'title': 'E-Order History',
                'translate': 'E-Order History',
                'type' : 'item',
                'icon' : 'menu',
                'url'  : '/e-order/history'
            },
            {
                'id'   : 'record-payment',
                'title': 'Record Payments',
                'translate': 'Record Payments',
                'type' : 'item',
                'icon' : 'menu',
                'url'  : '/record/payments'
            }
        ]
    },
    {
        'id' : 'testing',
        'title' : 'Testing',
        'translate' : 'Testing',
        'type' : 'group',
        'children' : [
            {
                'id':'module-1',
                'title':'Module-1',
                'translate':'Module Datatable example',
                'type':'item',
                'icon':'menu',
                'url':'module-1'
            },
             {
                'id':'module-2',
                'title':'Module-2',
                'translate':'Module form and validation example',
                'type':'item',
                'icon':'menu',
                'url':'module-2'
            }
        ]
    }
];
