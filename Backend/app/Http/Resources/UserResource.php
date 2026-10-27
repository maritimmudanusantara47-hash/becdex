<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'email'         => $this->email,
            'image'         => $this->image,
            'legal_documents' => $this->legal_documents,
            'organizational_chart' => $this->organizational_chart,
            'is_active'     => $this->is_active,
            'role'          => [
                'id'   => $this->role_id,
                'name' => $this->role?->name,
            ],
            'company'       => $this->whenLoaded('companyDetail', fn () => [
                'phone'                 => $this->companyDetail->company_phone,
                'country'               => $this->companyDetail->company_country,
                'company_field_id'      => $this->companyDetail->company_field_id,
                'company_field'         => $this->companyDetail->companyField?->name,
                'company_field_name_id' => $this->companyDetail->companyField?->name_id,
                'pic_name'              => $this->companyDetail->pic_name,
                'pic_position'     => $this->companyDetail->pic_position,
                'pic_email'        => $this->companyDetail->pic_email,
                'pic_phone'        => $this->companyDetail->pic_phone,
                'becdex_category'  => $this->companyDetail->becdexCategory?->name,
                'description'      => $this->companyDetail->description,
                'address'          => $this->companyDetail->address,
                'street_address'   => $this->companyDetail->street_address,
                'province'         => $this->companyDetail->province,
                'city'             => $this->companyDetail->city,
                'district'         => $this->companyDetail->district,
                'postal_code'      => $this->companyDetail->postal_code,
                'latitude'         => $this->companyDetail->latitude,
                'longitude'        => $this->companyDetail->longitude,
                'website'          => $this->companyDetail->website,
                'brand_name'       => $this->companyDetail->brand_name,
            ]),
            'is_profile_complete'           => $this->isCompany() ? $this->isProfileComplete() : true,
            'profile_completion_percentage' => $this->isCompany() ? $this->getProfileCompletionPercentage() : 100,
            'missing_fields'                => $this->isCompany() ? $this->getMissingProfileFields() : [],
            'missing_field_labels'          => $this->isCompany() ? $this->getMissingProfileFieldLabels() : (object)[],
            'email_verified_at' => $this->email_verified_at,
            'created_at'    => $this->created_at->toISOString(),
        ];
    }
}
