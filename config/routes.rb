Rails.application.routes.draw do
  root to: "search#index"
  post "/", controller: :search, action: :index
  resources :libraries do
    resources :models, except: [:index, :destroy] do
      collection do
        get "edit", action: "bulk_edit"
        patch "update", action: "bulk_update"
      end
      resources :parts, except: [:index, :destroy]
      resources :images, only: [:show]
    end
  end
  resources :creators
  mount Logs::Engine => "/logs"
end
