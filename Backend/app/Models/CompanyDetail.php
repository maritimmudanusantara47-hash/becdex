<?php
namespace App\Models;

use App\Services\AddressFormatter;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_phone',
        'company_country',
        'company_field_id',
        'pic_name',
        'pic_position',
        'pic_email',
        'pic_phone',
        'becdex_category_id',
        'description',
        'address',
        'street_address',
        'province',
        'city',
        'district',
        'postal_code',
        'latitude',
        'longitude',
        'website',
        'brand_name',
    ];

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if ($model->street_address) {
                $model->street_address = AddressFormatter::format($model->street_address);
                if ($model->province) $model->province = AddressFormatter::format($model->province);
                if ($model->city) $model->city = AddressFormatter::format($model->city);
                if ($model->district) $model->district = AddressFormatter::format($model->district);

                $parts = array_filter([
                    trim($model->street_address, ", "),
                    $model->district,
                    $model->city,
                    $model->province,
                    $model->postal_code ? 'Kode Pos: ' . $model->postal_code : null,
                ]);
                $raw = implode(', ', $parts);
                $model->address = AddressFormatter::format($raw);
            } elseif ($model->address) {
                // Data lama yang belum terstruktur tetap dinormalisasi
                $model->address = AddressFormatter::format($model->address);
            }
        });
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function companyField(): BelongsTo { return $this->belongsTo(CompanyField::class, 'company_field_id'); }
    public function becdexCategory(): BelongsTo { return $this->belongsTo(BecdexCategory::class, 'becdex_category_id'); }
}
