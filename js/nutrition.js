window.promiseCache = null;
window.lastKeyTime = 0;
const Foodname = (function(){
	const foodUrl = '/data/Food_Name.json';
	return {
		async load(){

			
			const response = await fetch(foodUrl);

			if(response.ok){
				const foodName = await response.json();
				window.promiseCache = foodName;
				
				var add = Main.query(document,'.food .add');
				var calculate = Main.query(document,'.food .calculate');
				
				var deleteRecord = Main.query(document,'.food .delete');
				
				calculate.addEventListener('click', (e) => this.submit(e));
				
				add.addEventListener('click', (event) => {
					
					const rows = Main.queryAll(document,'.food li.row');
					const row = Main.query(document,'.food ul.template');
					
					const lastRow = rows[rows.length - 2];
	
					const li = Main.newElem('li',{'class':'row'});	
					const ul = Main.newElem('ul');	
					
					ul.innerHTML = row.innerHTML;
					
					Main.subElem(li,[{'e':ul}]);
												
					lastRow.after(li);
					
					Foodname.loadNames();
				});				

				this.loadNames();																														
			}					
		},
		loadName(event,foodName){
			var items = Main.query(document,'.food .items');
						
			if(items)
				items.remove();
			
			const ul = Main.newElem('ul',{'class':'items'});
			ul.style.position = 'absolute';
			ul.left = event.target.offsetLeft;
			ul.top = event.target.offsetTop + event.target.height;
			
			for(const item of Object.values(foodName)){
				
				const regex = new RegExp(".*"+event.target.value, "i");
				
				if(event.target.value.length > 0 && item.Food_Description_EN.match(regex)){
					//const item = JSON.parse(match[0]);
					const li = Main.newElem('li',{'class':'item'});	
					const labelName = Main.newElem('span',{'class':'label'});
					labelName.id = item.Food_Code;
					labelName.innerHTML = item.Food_Description_EN;
					
					labelName.addEventListener('click',(e) => Foodname.nameSelected(e,event.target,ul));
									
					Main.subElem(ul,[{'e':li,'>':[{'e':labelName}]}]);		
				}
			}
			//}
			Main.subElem(event.target.parentElement,[{'e':ul}]);
		},
		loadNames(){
			const names = Main.queryAll(document,'.food .name');
			
			const foodName = window.promiseCache;
			
			for(const name of names){
				name.addEventListener('input', (event) => {
						if (event.defaultPrevented) {
							return;
						}
											  
					  if(window.nameTimeout)
						clearTimeout(window.nameTimeout);
					  
					  //console.log('test'); 
					  window.nameTimeout = setTimeout(Foodname.loadName, 300,event,foodName);
					 
					  // Update the reference for the next key press					 
																	
					});	
				}
		},
		nameSelected(event, name, names){
			const foodId = Main.query(name.closest('li.row'),'[name="id[]"]');
			
			name.value = event.target.innerHTML;
			foodId.value = event.target.id;		
			
			names.remove();	
		},
		deleteRow(elem){
			const row = elem.closest('li.row');
			row.remove();
		},
		back(content,main){
			content.style.display = 'block';
			const nutritionMain = Main.query(document,'.'+main);
			nutritionMain.remove();
		},		
		
		async submit(e){		
			e.preventDefault();
										
			Loader.load(1);			
			
			const jsonparts = {};
			const range = 200;
			
			try {
				var foodIds = Main.queryAll(document,'.food_id');		
								
			const content = Main.query(document,'.content');
			const foodMain = Main.query(document,'.food_main');
						
			const response = await fetch('/data/Nutrient_Name.json');
			const response1 = await fetch('/data/Nutrient_Amount.json');					
						
			if(response.ok && response1.ok){
				const nutritionName = await response.json();
				const nutritionAmount = await response1.json();				
				
				for(const item of Object.values(nutritionAmount)){
					const part = (Math.floor(item.FC / range)) + 1;
					const partName = 'nutrient_amount_'+part;
					if(!jsonparts[partName])
						jsonparts[partName]= [];
						
					jsonparts[partName].push(item);
				}
	
				let nutritionAmounts = [];			

				for(const foodId of foodIds){	

					const weightGram = Main.query(foodId.closest('li.row'),'.weightGram');
					
					const foodWeight = parseInt(weightGram.value);
					
					const part = (Math.floor(parseInt(foodId.value) / range)) + 1;
					const partName = 'nutrient_amount_'+part;
										
					let partFood = [];
										
					if(jsonparts[partName])
						partFood = jsonparts[partName];										
					
					for(const item of partFood){		
															
						if(item.FC === parseInt(foodId.value)){
							
							const foodNutritionAmount = item.NA * foodWeight / 100; 
							
							let found = false;
							for(const nutrition of nutritionAmounts){
								if(nutrition.nutrition_code === item.NC){
									nutrition.nutrition_amount += foodNutritionAmount;
									found = true;
									break;
								}
							}							

							if(!found)
								nutritionAmounts.push({'nutrition_code':item.NC,'nutrition_amount':foodNutritionAmount});

						}
					}					
				}							
				
				const main = Main.newElem('div',{'class':'nutrition_main'});
				const link = Main.newElem('div',{'class':'link'});
				const div = Main.newElem('div',{'class':'nutrients'});
				
				let span = Main.newElem('span',{'class':'back'});
				span.innerHTML = 'Back';
				
				span.addEventListener('click',(e) => Foodname.back(foodMain,'nutrition_main'));
				
				Main.subElem(link,[{'e':span}]);								
				
				const table = Main.newElem('table',{'class':'table'});
				let tr = Main.newElem('thead');
				let td = Main.newElem('td',{'class':'column-1'});
																				
				span = Main.newElem('span',{'class':'name'});
				span.innerHTML = 'Nutrient';
				
				Main.subElem(table,[{'e':tr,'>':[{'e':td,'>':[{'e':span}]}]}]);		
				
				td = Main.newElem('td',{'class':'column-2'});
				span = Main.newElem('span',{'class':'amount'});
				span.innerHTML = 'Nutrient Amount';												
				
				Main.subElem(table,[{'e':tr,'>':[{'e':td,'>':[{'e':span}]}]}]);
				Main.subElem(div,[{'e':table}]);					
				
				foodMain.style.display = 'none';
				
				Main.subElem(main,[{'e':link}]);		
				Main.subElem(main,[{'e':div}]);		
				
				Main.subElem(content,[{'e':main}]);
				
				for(const item of Object.values(nutritionName)){		
				
					let nutritionAmountRow = 0;
					for(const nutritionAmount of nutritionAmounts){
						if(nutritionAmount.nutrition_code === item.Nutrient_Code){
							
							nutritionAmountRow = nutritionAmount.nutrition_amount;
							break;
						}
					}
					
					tr = Main.newElem('tr');
					td = Main.newElem('td',{'class':'column-1'});
					span = Main.newElem('span',{'class':'name'});
					span.innerHTML = item.Nutrient_Name_EN;
					
					Main.subElem(table,[{'e':tr,'>':[{'e':td,'>':[{'e':span}]}]}]);		
					
					td = Main.newElem('td',{'class':'column-2'});
					span = Main.newElem('span',{'class':'amount'});
					span.innerHTML = (Math.round(nutritionAmountRow * 100) / 100) + ' '+ item.Nutrient_Unit;
					
					Main.subElem(table,[{'e':tr,'>':[{'e':td,'>':[{'e':span}]}]}]);		
				}
				
			}
				} catch (error) {
				console.error(error.message);
			  }
			  finally{
				Loader.clearLoader();
			  }
				//Loader.clearLoader();					
		}
	}
})();

const Loader = (function(){

	return {
		load(n){		

			const loaderDiv = Main.query(document,'.loader');
			loaderDiv.style.display = 'block';	
			
			var height = loaderDiv.offsetHeight;
			//var width = loaderDiv.offsetWidth;
			
			//var screenHeight = screen.height;
			//var screenWidth = screen.width;
			
			//var left = Math.floor((window.innerWidth - width) / 2);
			var top = window.scrollY + Math.floor((window.innerHeight - height) / 2);
			
			//loaderDiv.style.left = left + 'px';
			loaderDiv.style.top = top + 'px';			
			
			//console.log(loaderDiv.offsetParent.top);
			//console.log(window.scrollY);
			//console.log(window.innerHeight);
			//console.log(loaderDiv.style.top);
			//console.log(loaderDiv.style.left);

		},
		clearLoader(){
			const loader = Main.query(document,'.loader');
			loader.style.display = 'none';			
		}
	}
})();
