export const brConfig = {
	products: {
		index: [
			{
				type: 'current',
				url: '/products',
				name: 'Product List'
			}
		]
	},
        adminprincipal: {
                index: [
                        {
                                type: 'current',
                                url: '/user-management/admin-principal',
                                name: 'Admin Principal List'
                        }
                ]
        },
	admin:{
		user:{
			index:[{
        		type:'parent',
        		url:'/admin',
        		name:'Admin'
        	},
        	{
        		type:'current',
        		url:'',
        		name:'User'
        	}],
        	create:[{
        		type:'parent',
        		url:'/admin',
        		name:'Admin'
        	},
        	{
        		type:'parent',
        		url:'/admin/user',
        		name:'User'
        	},
        	{
        		type:'current',
        		url:'',
        		name:'Create'
        	}],
        	edit:[{
        		type:'parent',
        		url:'/admin',
        		name:'Admin'
        	},
        	{
        		type:'parent',
        		url:'/admin/user',
        		name:'User'
        	},
        	{
        		type:'current',
        		url:'',
        		name:'Edit'
        	}]
		},

		role:{
			index:[{
        		type:'parent',
        		url:'/admin',
        		name:'Admin'
        	},
        	{
        		type:'current',
        		url:'',
        		name:'Role'
        	}],
        	create:[{
        		type:'parent',
        		url:'/admin',
        		name:'Admin'
        	},
        	{
        		type:'parent',
        		url:'/admin/role',
        		name:'Role'
        	},
        	{
        		type:'current',
        		url:'',
        		name:'Create'
        	}],
        	edit:[{
        		type:'parent',
        		url:'/admin',
        		name:'Admin'
        	},
        	{
        		type:'parent',
        		url:'/admin/role',
        		name:'Role'
        	},
        	{
        		type:'current',
        		url:'',
        		name:'Edit'
        	}]
		}
	}
}